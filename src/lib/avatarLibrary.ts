export type AvatarGender = 'male' | 'female';

export interface Avatar {
  id: string;
  name: string;
  gender: AvatarGender;
  svg: string;
}

// Cores de pele
const skinTones = {
  light: '#FFDBB4',
  medium: '#E8B796',
  tan: '#C68642',
  dark: '#8D5524',
  deep: '#5C3317',
};

// Cores de cabelo
const hairColors = {
  black: '#1A1A1A',
  brown: '#4A3728',
  blonde: '#D4A574',
  red: '#8B2500',
  gray: '#9CA3AF',
};

// Gera avatar masculino
function generateMaleAvatar(id: string, name: string, skinTone: string, hairColor: string, hasBeard: boolean, hairStyle: 'short' | 'medium' | 'bald'): Avatar {
  const beardPath = hasBeard ? `<ellipse cx="50" cy="72" rx="12" ry="8" fill="${hairColor}" opacity="0.9"/>` : '';
  
  let hairPath = '';
  if (hairStyle === 'short') {
    hairPath = `<path d="M30 35 Q50 20 70 35 Q72 30 70 25 Q50 15 30 25 Q28 30 30 35Z" fill="${hairColor}"/>`;
  } else if (hairStyle === 'medium') {
    hairPath = `<path d="M28 40 Q50 15 72 40 Q75 30 72 22 Q50 8 28 22 Q25 30 28 40Z" fill="${hairColor}"/>`;
  }
  // bald = sem cabelo

  return {
    id,
    name,
    gender: 'male',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#E2E8F0"/>
      <circle cx="50" cy="52" r="28" fill="${skinTone}"/>
      <ellipse cx="50" cy="80" rx="25" ry="18" fill="${skinTone}"/>
      ${hairPath}
      <circle cx="40" cy="48" r="3" fill="#1A1A1A"/>
      <circle cx="60" cy="48" r="3" fill="#1A1A1A"/>
      <ellipse cx="50" cy="55" rx="3" ry="2" fill="${skinTone}" stroke="#1A1A1A" stroke-width="0.5" opacity="0.8"/>
      <path d="M44 62 Q50 66 56 62" stroke="#1A1A1A" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      ${beardPath}
      <path d="M35 45 Q40 43 44 45" stroke="${hairColor}" stroke-width="1.5" fill="none"/>
      <path d="M56 45 Q60 43 65 45" stroke="${hairColor}" stroke-width="1.5" fill="none"/>
    </svg>`
  };
}

// Gera avatar feminino
function generateFemaleAvatar(id: string, name: string, skinTone: string, hairColor: string, hairStyle: 'long' | 'short' | 'curly' | 'ponytail'): Avatar {
  let hairPath = '';
  
  if (hairStyle === 'long') {
    hairPath = `
      <path d="M22 45 Q20 70 30 85 L35 85 Q28 70 30 50Z" fill="${hairColor}"/>
      <path d="M78 45 Q80 70 70 85 L65 85 Q72 70 70 50Z" fill="${hairColor}"/>
      <path d="M25 40 Q50 12 75 40 Q77 30 72 20 Q50 5 28 20 Q23 30 25 40Z" fill="${hairColor}"/>
    `;
  } else if (hairStyle === 'short') {
    hairPath = `<path d="M26 42 Q50 15 74 42 Q76 32 72 22 Q50 8 28 22 Q24 32 26 42Z" fill="${hairColor}"/>`;
  } else if (hairStyle === 'curly') {
    hairPath = `
      <circle cx="28" cy="38" r="8" fill="${hairColor}"/>
      <circle cx="72" cy="38" r="8" fill="${hairColor}"/>
      <circle cx="35" cy="28" r="7" fill="${hairColor}"/>
      <circle cx="65" cy="28" r="7" fill="${hairColor}"/>
      <circle cx="50" cy="24" r="8" fill="${hairColor}"/>
      <circle cx="25" cy="50" r="6" fill="${hairColor}"/>
      <circle cx="75" cy="50" r="6" fill="${hairColor}"/>
    `;
  } else if (hairStyle === 'ponytail') {
    hairPath = `
      <path d="M26 42 Q50 15 74 42 Q76 32 72 22 Q50 8 28 22 Q24 32 26 42Z" fill="${hairColor}"/>
      <ellipse cx="75" cy="35" rx="8" ry="15" fill="${hairColor}" transform="rotate(30 75 35)"/>
    `;
  }

  return {
    id,
    name,
    gender: 'female',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#FCE7F3"/>
      <circle cx="50" cy="52" r="26" fill="${skinTone}"/>
      <ellipse cx="50" cy="80" rx="22" ry="16" fill="${skinTone}"/>
      ${hairPath}
      <circle cx="41" cy="48" r="2.5" fill="#1A1A1A"/>
      <circle cx="59" cy="48" r="2.5" fill="#1A1A1A"/>
      <ellipse cx="50" cy="54" rx="2.5" ry="1.8" fill="${skinTone}" stroke="#1A1A1A" stroke-width="0.4" opacity="0.7"/>
      <path d="M45 61 Q50 65 55 61" stroke="#E11D48" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M36 44 Q40 42 44 44" stroke="${hairColor}" stroke-width="1" fill="none"/>
      <path d="M56 44 Q60 42 64 44" stroke="${hairColor}" stroke-width="1" fill="none"/>
      <circle cx="35" cy="52" r="3" fill="#FCA5A5" opacity="0.4"/>
      <circle cx="65" cy="52" r="3" fill="#FCA5A5" opacity="0.4"/>
    </svg>`
  };
}

// Biblioteca de avatares masculinos (20)
export const maleAvatars: Avatar[] = [
  generateMaleAvatar('m1', 'Carlos', skinTones.light, hairColors.black, false, 'short'),
  generateMaleAvatar('m2', 'Pedro', skinTones.medium, hairColors.brown, true, 'short'),
  generateMaleAvatar('m3', 'João', skinTones.tan, hairColors.black, false, 'medium'),
  generateMaleAvatar('m4', 'Lucas', skinTones.light, hairColors.blonde, false, 'medium'),
  generateMaleAvatar('m5', 'Miguel', skinTones.dark, hairColors.black, true, 'short'),
  generateMaleAvatar('m6', 'Gabriel', skinTones.medium, hairColors.black, false, 'bald'),
  generateMaleAvatar('m7', 'Rafael', skinTones.light, hairColors.brown, true, 'medium'),
  generateMaleAvatar('m8', 'Arthur', skinTones.tan, hairColors.brown, false, 'short'),
  generateMaleAvatar('m9', 'Bruno', skinTones.deep, hairColors.black, false, 'short'),
  generateMaleAvatar('m10', 'Diego', skinTones.medium, hairColors.black, true, 'bald'),
  generateMaleAvatar('m11', 'Thiago', skinTones.light, hairColors.red, false, 'medium'),
  generateMaleAvatar('m12', 'Felipe', skinTones.tan, hairColors.black, true, 'medium'),
  generateMaleAvatar('m13', 'André', skinTones.dark, hairColors.black, false, 'bald'),
  generateMaleAvatar('m14', 'Ricardo', skinTones.light, hairColors.gray, true, 'short'),
  generateMaleAvatar('m15', 'Marcos', skinTones.medium, hairColors.blonde, false, 'short'),
  generateMaleAvatar('m16', 'Daniel', skinTones.tan, hairColors.brown, true, 'bald'),
  generateMaleAvatar('m17', 'Gustavo', skinTones.deep, hairColors.black, true, 'short'),
  generateMaleAvatar('m18', 'Leandro', skinTones.light, hairColors.brown, false, 'medium'),
  generateMaleAvatar('m19', 'Victor', skinTones.medium, hairColors.gray, false, 'bald'),
  generateMaleAvatar('m20', 'Eduardo', skinTones.dark, hairColors.black, false, 'medium'),
];

// Biblioteca de avatares femininos (20)
export const femaleAvatars: Avatar[] = [
  generateFemaleAvatar('f1', 'Ana', skinTones.light, hairColors.black, 'long'),
  generateFemaleAvatar('f2', 'Maria', skinTones.medium, hairColors.brown, 'curly'),
  generateFemaleAvatar('f3', 'Julia', skinTones.tan, hairColors.black, 'ponytail'),
  generateFemaleAvatar('f4', 'Laura', skinTones.light, hairColors.blonde, 'long'),
  generateFemaleAvatar('f5', 'Beatriz', skinTones.dark, hairColors.black, 'curly'),
  generateFemaleAvatar('f6', 'Camila', skinTones.medium, hairColors.black, 'short'),
  generateFemaleAvatar('f7', 'Sofia', skinTones.light, hairColors.brown, 'ponytail'),
  generateFemaleAvatar('f8', 'Isabella', skinTones.tan, hairColors.brown, 'long'),
  generateFemaleAvatar('f9', 'Larissa', skinTones.deep, hairColors.black, 'curly'),
  generateFemaleAvatar('f10', 'Fernanda', skinTones.medium, hairColors.black, 'short'),
  generateFemaleAvatar('f11', 'Carolina', skinTones.light, hairColors.red, 'long'),
  generateFemaleAvatar('f12', 'Amanda', skinTones.tan, hairColors.black, 'ponytail'),
  generateFemaleAvatar('f13', 'Gabriela', skinTones.dark, hairColors.black, 'short'),
  generateFemaleAvatar('f14', 'Patrícia', skinTones.light, hairColors.gray, 'curly'),
  generateFemaleAvatar('f15', 'Renata', skinTones.medium, hairColors.blonde, 'long'),
  generateFemaleAvatar('f16', 'Mariana', skinTones.tan, hairColors.brown, 'short'),
  generateFemaleAvatar('f17', 'Aline', skinTones.deep, hairColors.black, 'ponytail'),
  generateFemaleAvatar('f18', 'Priscila', skinTones.light, hairColors.brown, 'curly'),
  generateFemaleAvatar('f19', 'Vanessa', skinTones.medium, hairColors.gray, 'short'),
  generateFemaleAvatar('f20', 'Natália', skinTones.dark, hairColors.black, 'long'),
];

// Todos os avatares
export const allAvatars: Avatar[] = [...maleAvatars, ...femaleAvatars];

// Função para obter avatar por ID
export function getAvatarById(id: string | null | undefined): Avatar | null {
  if (!id) return null;
  return allAvatars.find(avatar => avatar.id === id) || null;
}

// Avatar padrão (primeiro masculino)
export const defaultAvatar = maleAvatars[0];
