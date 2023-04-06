import * as fs from 'fs';

function getRolesJson() {
    const rolesJson = fs.readFileSync('./roles.json', 'utf8');
    return JSON.parse(rolesJson);
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

export function addTeamRole(roleId: string) {
    const roles = getRolesJson();
    roles['team roles'].push(roleId);
    fs.writeFileSync('./roles.json', JSON.stringify(roles, null, 2));
}

export function isTeamRoleExists(roleId: string): boolean {
    const roles = getRolesJson();
    return roles['team roles'].includes(roleId);
}

export function setNoTeamRoleId(roleId: string) {
    const roles = getRolesJson();
    roles['no team'] = roleId;
    fs.writeFileSync('./roles.json', JSON.stringify(roles, null, 2));
}

export function setFTCTeamRoleId(roleId: string) {
    const roles = getRolesJson();
    roles['ftc role'] = roleId;
    fs.writeFileSync('./roles.json', JSON.stringify(roles, null, 2));
}