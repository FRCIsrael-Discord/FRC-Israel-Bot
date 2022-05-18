import { ICommand } from 'wokcommands';

const teamList: string[] = [
    '1574', '1576', '1577', '1580', '1657',
    '1690', '1937', '1942', '1943', '1954',
    '2096', '2212', '2230', '2231', '2630',
    '2679', '3065', '3075', '3083', '3211',
    '3316', '3339', '3388', '3835', '4319',
    '4320', '4338', '4416', '4586', '4590',
    '4661', '4744', '5135', '5291', '5554',
    '5614', '5635', '5654', '5715', '5928',
    '5951', '5987', '5990', '6104', '6168',
    '6230', '6738', '6740', '6741', '7039',
    '7067', '7112', '7177', '7845', '8175',
    '8223', '8843'
]

export default {
    category: 'Team Manager',
    description: 'Sets the user nickname and group role',

    testOnly: true,
    slash: true,

    expectedArgs: '<Nickname> <Team Number>',
    minArgs: 2,
    maxArgs: 2,
    
    callback: async ({interaction, args, member, guild}) => {  
        const nickname = args[0];
        const teamNumber = args[1];
        if (teamList.includes(teamNumber)) {
            await interaction.deferReply({ephemeral: true});
            teamList.forEach(async team => {
                const role = guild?.roles.cache.find(role => role.name.split(" | ")[1] == team);
                if (role != undefined) await member.roles.remove(role);
            });

            const noTeamRole = guild?.roles.cache.find(role => role.name == "No Team");
            if (noTeamRole != undefined) await member.roles.remove(noTeamRole);

            const newRole = guild?.roles.cache.find(role => role.name.split(" | ")[1] == teamNumber);
            if (newRole != undefined) {
                await member.roles.add(newRole);
            } else {
                await interaction.editReply({content: "Team role not found!"});
                return;
            }

            const newNick = `${nickname} | ${teamNumber}`;
            try {
                await member.setNickname(newNick);
                await interaction.editReply({content: `Your group have been updated to ${teamNumber}`});
            } catch (e) {
                if (guild?.ownerId == member.id) {
                    await interaction.editReply({content: 'Can\'t change owner\'s nickname!'});
                } else {
                    await interaction.editReply({content: 'Can\'t set nickname'});
                }
            }

        } else {
            await interaction.reply({content: 'Team number is invalid!', ephemeral: true});
        }
    }
} as ICommand