import * as fs from 'fs';
import { logWarn } from './logger';
import { SupportSetting, SupportType } from './types/support';

interface ConfigObject {
    'token': string;
    'roles': RolesObject;
    'supportSettings': {
        [key in SupportType]: SupportSetting;
    };
}

interface RolesObject {
    'teams': string[];
    'noTeam': string;
    'ftc': string;
};


const filePath = './config.json';

if (!fs.existsSync(filePath)) {
    logWarn('config.json does not exist!');
    logWarn('Please rename config.example.json to config.json and fill in the values.');
    logWarn('Exiting...');
    process.exit(1);
}
const config: ConfigObject = require(filePath);

function updateConfigFile() {
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
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

export function setSupportSetting(supportType: SupportType, supportSetting: SupportSetting) {
    config.supportSettings[supportType] = supportSetting;
    updateConfigFile();
}

export function getSupportSetting(supportType: SupportType): SupportSetting {
    return config.supportSettings[supportType];
}