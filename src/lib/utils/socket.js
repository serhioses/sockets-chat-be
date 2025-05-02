export function genChatId(id1, id2) {
    return [id1, id2].sort().join('-');
}
