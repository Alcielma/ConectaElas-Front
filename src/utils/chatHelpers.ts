/**
 * Função para remover chats duplicados de uma lista
 * Usa o ID do chat como critério de deduplicação
 * @param {any[]} chats - Lista de chats que pode conter duplicatas
 * @returns {any[]} Lista de chats sem duplicatas
 */
export function deduplicateChats(chats: any[]) {
  const seen = new Set();
  return chats.filter(chat => {
    if (seen.has(chat.id)) return false;
    seen.add(chat.id);
    return true;
  });
}
