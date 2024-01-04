import { GuildMember, ModalSubmitInteraction, Role } from "discord.js";
import { IBot } from "../../utils/interfaces/IBot";
import { frcTeamList, ftcTeamList } from "../../utils/teamLists";
import { getTeamRoles } from "../../utils/config";
import { addNoTeamRole, hasNoTeamRole, renameMember, setFRCRole, setFTCRole } from "../../utils/userConfig";
import { IModal } from "../../utils/interfaces/IModal";

module.exports = {
    id: 'configFTCUserModal',
    catergory: 'Team Manager',
    deferReply: true,
    ephemeral: true,

    execute: async (bot: IBot, interaction: ModalSubmitInteraction) => {
        const { guild } = interaction;
        const member: GuildMember = interaction.member as GuildMember

        const nickname = interaction.fields.getTextInputValue('nicknameInput');
        const teamNumber = interaction.fields.getTextInputValue('teamInput');

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
} as IModal