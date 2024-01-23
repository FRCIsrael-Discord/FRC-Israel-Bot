import * as fs from 'fs';
import { logWarn } from '../utils/logger';
import { SupportType } from '../lib/types/support'

interface ConfigObject {
    token: string;
    mongoURI: string;
    roles: Roles;
    channels: Channels;
    supportSettings: {
        channelId: string,
        logsChannelId: string,
        webhookURL: string,
        cooldown: number,
        roles: {
            [key in SupportType]: string;
        }
    };
}

interface Roles {
    teams: string[];
    noTeam: string;
    ftc: string;
    helper: string;
};

interface Channels {
    ugh: string;
}


const filePath = 'config.json';

if (!fs.existsSync(filePath)) {
    logWarn('config.json does not exist!');
    logWarn('Please rename config.example.json to config.json and fill in the values.');
    logWarn('Exiting...');
    process.exit(1);
}

const config: ConfigObject = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

function updateConfigFile() {
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
}

export function getBotToken(): string {
    return config.token;
}

export function getMongoURI(): string {
    return config.mongoURI;
}

export function getTeamRoles(): string[] {
    return config.roles.teams;
}

export function getNoTeamRoleId(): string {
    return config.roles.noTeam;
}

export function getFTCTeamRoleId(): string {
    return config.roles.ftc;
}

export function setTeamRoles(roleIds: string[]) {
    config.roles.teams = roleIds;
    updateConfigFile();
}

export function isTeamRoleExists(roleId: string): boolean {
    return config.roles.teams.includes(roleId);
}

export function setNoTeamRoleId(roleId: string) {
    config.roles.noTeam = roleId;
    updateConfigFile();
}

export function setFTCTeamRoleId(roleId: string) {
    config.roles.ftc = roleId;
    updateConfigFile();
}

export function setSupportRole(supportType: SupportType, roleId: string) {
    config.supportSettings.roles[supportType] = roleId;
    updateConfigFile();
}

export function getSupportRole(supportType: SupportType): string | undefined {
    return config.supportSettings.roles[supportType];
}

export function getSupportCooldown(): number {
    return config.supportSettings.cooldown;
}

export function setSupportCooldown(cooldown: number) {
    config.supportSettings.cooldown = cooldown;
    updateConfigFile();
}

export function getSupportForum() {
    return config.supportSettings.channelId;
}

export function setSupportForum(channelId: string) {
    config.supportSettings.channelId = channelId;
    updateConfigFile();
}

export function getUghChannelId() {
    return config.channels.ugh;
}

export function setUghChannelId(channelId: string) {
    config.channels.ugh = channelId;
    updateConfigFile();
}

export function getHelperRoleId(): string {
    return config.roles.helper;
}

export function setHelperRoleId(roleId: string) {
    config.roles.helper = roleId;
    updateConfigFile();
}

export function getSupportLogsChannelId() {
    return config.supportSettings.logsChannelId;
}

export function setSupportLogsChannelId(channelId: string) {
    config.supportSettings.logsChannelId = channelId;
    updateConfigFile();
}

export function getSupportWebhookURL() {
    return config.supportSettings.webhookURL;
}

export function setSupportWebhookURL(url: string) {
    config.supportSettings.webhookURL = url;
    updateConfigFile();
}