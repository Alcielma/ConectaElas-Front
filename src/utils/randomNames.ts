/**
 * Função para gerar um nome aleatório para um usuário
 * Combina um animal com uma cor para criar um nome único
 * Armazena os nomes gerados no localStorage para manter a consistência
 * @param {number} userId - ID único do usuário
 * @returns {string} Nome aleatório gerado ou existente para o usuário
 */
export const generateRandomName = (userId: number) => {
  const storageKey = "userNames";

  let userNames: Record<number, string> = {};
  try {
    // Tenta ler os nomes armazenados no localStorage
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      userNames = JSON.parse(stored);
    }
  } catch (e) {
    console.error("Erro ao ler nomes do localStorage:", e);
  }

  // Se já existe um nome para o usuário, retorna ele
  if (userNames[userId]) {
    const existingName = userNames[userId];
    return existingName.split('#')[0];
  }

  // Lista de cores para combinar com os animais
  const colors = [
    "Vermelho",
    "Azul",
    "Verde",
    "Amarelo",
    "Roxo",
    "Laranja",
    "Rosa",
    "Marrom",
    "Preto",
    "Branco",
    "Cinza",
    "Ciano",
    "Magenta",
    "Prateado",
    "Bronze",
  ];

  // Lista de animais para combinar com as cores
  const animals = [
    "Leão",
    "Tigre",
    "Urso",
    "Lobo",
    "Águia",
    "Tubarão",
    "Pantera",
    "Falcão",
    "Raposa",
    "Gavião",
    "Coelho",
    "Tartaruga",
    "Guepardo",
    "Onça",
    "Pinguim",
  ];

  // Seleciona uma cor aleatória da lista
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  // Seleciona um animal aleatório da lista
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];

  // Combina o animal com a cor para formar o novo nome
  const newName = `${randomAnimal} ${randomColor}`;

  // Armazena o novo nome no localStorage
  userNames[userId] = newName;
  try {
    localStorage.setItem(storageKey, JSON.stringify(userNames));
  } catch (e) {
    console.error("Erro ao salvar nomes no localStorage:", e);
  }

  return newName;
};
