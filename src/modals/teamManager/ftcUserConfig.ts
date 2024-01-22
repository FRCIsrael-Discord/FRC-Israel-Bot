import { GuildMember, ModalSubmitInteraction } from 'discord.js';
import { Bot, Modal } from '../../lib/types/discord';
import { addNoTeamRole, hasNoTeamRole, renameMember, setFTCRole } from '../../lib/userConfig/user-config';
import { ftcTeamList } from '../../utils/teamLists';

module.exports = {
    id: 'configFTCUserModal',
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

        if (ftcTeamList.includes(teamNumber)) {
            // Set Nickname
            const oldNickname = member.nickname;
            const renamesuccess = await renameMember(member, guild!, nickname, teamNumber);
            if (!renamesuccess) {
                return await interaction.followUp({ content: 'Can\'t set nickname, Please reach out to a staff member!' });
            }

            // Add new team role
            const roleSuccess = await setFTCRole(member, guild!);
            if (!roleSuccess) {
                // If role not found, revert nickname and add back old roles
                if (renamesuccess) await renameMember(member, guild!, oldNickname!, teamNumber);
                await addNoTeamRole(member, guild!);

                return await interaction.followUp({ content: 'Team role not found!' });
            }

            await interaction.followUp({ content: 'Your group and nickname have been set!' });
        } else {
            await interaction.followUp({ content: 'Team number is invalid!' });
        }
    }
} as Modal