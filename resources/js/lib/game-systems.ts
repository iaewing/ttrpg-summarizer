export const GAME_SYSTEMS = [
    'D&D 5e',
    'Daggerheart',
    'Pathfinder 2e',
    'Pathfinder 1e',
    'Call of Cthulhu',
    'Vampire: The Masquerade',
    'World of Darkness',
    'Shadowrun',
    'Cyberpunk RED',
    'Star Wars RPG',
    'Warhammer 40k',
    'Savage Worlds',
    'GURPS',
    'Fate Core',
    'Powered by the Apocalypse',
    'Blades in the Dark',
    'Custom System',
    'Other'
] as const;

export type GameSystem = typeof GAME_SYSTEMS[number]; 