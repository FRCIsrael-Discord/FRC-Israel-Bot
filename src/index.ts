import { Client, Intents } from 'discord.js';
import WOKCommands from 'wokcommands';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});



client.on('ready', () => {
    new WOKCommands(client, {
        commandDir: path.join(__dirname, 'commands'),
        typeScript: true,

        testServers: ['851789251754328064', '959144521621458974']
    });

    console.log("FRC Israel bot is now active!");
});

client.on('guildMemberUpdate', (oldMember, newMember) => {
    // const server = newMember.guild;
    // console.log(oldMember.nickname, newMember.nickname);
    // if (newMember.nickname && newMember.nickname != oldMember.nickname) {
    //     if (/\w+ \| \d/g.test(newMember.nickname)) {
    //         console.log("changed nick");

    //         const number = newMember.nickname.split("|")[1].replace(/[^0-9]/g, "");

    //         if (teamList.includes(number)) {
    //             teamList.forEach(team => {
    //                 const role = server.roles.cache.find(role => role.name.split(" | ")[1] == team);
    //                 if (role != undefined) newMember.roles.remove(role);
    //             });

    //             const newRole = server.roles.cache.find(role => role.name.split(" | ")[1] == number);
    //             if (newRole != undefined) newMember.roles.add(newRole);
    //         } else newMember.setNickname(oldMember.nickname);
    //     } else {
    //         if (/\w+ \| \d/g.test(oldMember.nickname!)) newMember.setNickname(oldMember.nickname);
    //         else newMember.setNickname("");
    //     }
    // }
});

client.login(process.env.TOKEN);