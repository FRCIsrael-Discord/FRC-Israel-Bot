import * as fs from 'fs';
import { RequireAtLeastOne } from './types/RequireAtLeastOne';

const filePath = './roles.json';

interface RolesJson {
    'team roles': string[];
    'no team': string;
    'ftc role': string;
}

function createRolesJson() {
    const rolesJson = {
        'team roles': [],
        'no team': '',
        'ftc role': ''
    } as RolesJson;
    fs.writeFileSync(filePath, JSON.stringify(rolesJson, null, 2));
}

function isRolesJsonExists(): boolean {
    return fs.existsSync(filePath);
}

function getRolesJson() {
    if (!isRolesJsonExists()) createRolesJson();

    const rolesJson = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rolesJson) as RolesJson;
}

function updateRolesJson(update: RequireAtLeastOne<RolesJson>) {
    const roles = getRolesJson();
    const newObject = Object.assign(roles, update);

    fs.writeFileSync(filePath, JSON.stringify(newObject, null, 2));
}

export function getTeamRoles(): string[] {
    const roles = getRolesJson();
    return roles['team roles'];
}

export function getNoTeamRoleId(): string {
    const roles = getRolesJson();
    return roles['no team'];
}

export function getFTCTeamRoleId(): string {
    const roles = getRolesJson();
    return roles['ftc role'];
}

export function setTeamRoles(roleIds: string[]) {
    updateRolesJson({
        'team roles': roleIds
    });
}

export function isTeamRoleExists(roleId: string): boolean {
    const roles = getRolesJson();
    return roles['team roles'].includes(roleId);
}

export function setNoTeamRoleId(roleId: string) {
    updateRolesJson({
        'no team': roleId
    });
}

export function setFTCTeamRoleId(roleId: string) {
    updateRolesJson({
        'ftc role': roleId
    });
}