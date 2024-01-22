import { GuildMember, ModalSubmitInteraction, Role } from 'discord.js';
import { getTeamRoles } from '../../config/config';
import { Bot, Modal } from '../../lib/types/discord';
import { addNoTeamRole, hasNoTeamRole, renameMember, setFRCRole } from '../../lib/userConfig/user-config';
import { frcTeamList } from '../../utils/teamLists';

module.exports = {
    id: 'configFRCUserModal',
    catergory: 'Team Manager',
    deferReply: true,
    ephemeral: true,

    execute: async (bot: Bot, interaction: ModalSubmitInteraction) => {
        const { guild } = interaction;
        const member: GuildMember = interaction.member as GuildMember

        const nickname = interaction.fields.getTextInputValue('nicknameInput');
        const teamNumber = interaction.fields.getTextInputValue('teamInput');

        if (!nickname.match(/^[a-zA-Z ]+$/)) {
            return await interaction.followUp({ content: 'Nickname can only contain english letters and spaces!' });
        }
        if (!nickname.replace(/\s/g, '').length) {
            return await interaction.followUp({ content: 'Nickname can\'t be only spaces!' });
        }

        if (!await hasNoTeamRole(member, guild!)) {
            return await interaction.followUp({ content: 'You already have a team!' });
        }

        if (frcTeamList.includes(teamNumber)) {
            const teamRoles = getTeamRoles();
            const removedRoles: Role[] = [];
            const memberRoles = member.roles.cache;
            const guildRoles = await guild!.roles.fetch();

            // Set Nickname
            const oldNickname = member.nickname;
            const renamesuccess = await renameMember(member, guild!, nickname, teamNumber);
            if (!renamesuccess) {
                return await interaction.followUp({ content: 'Can\'t set nickname, Please reach out to a staff member!' });
            }

            // Remove old team roles
            for (const role of teamRoles) {
                if (memberRoles.find(r => r.id == role)) {
                    const guildRole = guildRoles.get(role);
                    if (guildRole) {
                        removedRoles.push(guildRole);
                        member.roles.remove(guildRole);
                    }
                }
            }

            // Add new team role
            const roleSuccess = await setFRCRole(guildRoles, member, teamNumber, guild!);
            if (!roleSuccess) {
                // If role not found, revert nickname and add back old roles
                if (renamesuccess) await renameMember(member, guild!, oldNickname!, teamNumber);
                for (const role of removedRoles) {
                    member.roles.add(role);
                }
                await addNoTeamRole(member, guild!);

                return await interaction.followUp({ content: 'Team role not found!' });
            }

            await interaction.followUp({ content: 'Your group and nickname have been set!' });
        } else {
            await interaction.followUp({ content: 'Team number is invalid!' });
        }
    }
} as Modal