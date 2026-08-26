export type ArmorPiece = {
  name: string;
  stars: number;
  hp: number;
  defense: number;
  strength: number;
  critDamage: number;
  intelligence: number;
};

export type WeaponStats = {
  name: string;
  damage: number;
  strength: number;
  critDamage: number;
  intelligence: number;
  stars: number;
  masterStars: number;
  enchants: Record<string, number>;
};

export type PetStats = {
  name: string;
  level: number;
  strength: number;
  critDamage: number;
  health: number;
  defense: number;
};

export type SimulatorLoadout = {
  combatLevel: number;
  catacombsLevel: number;
  magicalPower: number;
  accessoryPowerTuning: string;
  insideDungeons: boolean;
  masterMode: boolean;
  targetMob: keyof typeof MOB_TARGETS;
  weapon: WeaponStats;
  helmet: ArmorPiece;
  chestplate: ArmorPiece;
  leggings: ArmorPiece;
  boots: ArmorPiece;
  pet: PetStats;
};

export type SimulationResult = {
  singleHitDamage: number;
  firstStrikeDamage: number;
  dps: number;
  effectiveHealth: number;
  totalHealth: number;
  totalDefense: number;
  totalStrength: number;
  totalCritDamage: number;
  totalIntelligence: number;
  ferocity: number;
  abilityDamage: number;
  mobKillTimeSeconds: number;
  upgradeSuggestions: Array<{
    title: string;
    description: string;
    dpsGainPct: number;
    estimatedCostCoins: number;
  }>;
};

export const ACCESSORY_POWERS: Record<
  string,
  { name: string; bonusName: string; strPerMp: number; cdPerMp: number; intPerMp: number }
> = {
  Hurtful: {
    name: "Hurtful",
    bonusName: "Crit Damage Focus",
    strPerMp: 0.15,
    cdPerMp: 0.38,
    intPerMp: 0,
  },
  Silky: {
    name: "Silky",
    bonusName: "Crit Damage Peak",
    strPerMp: 0.05,
    cdPerMp: 0.45,
    intPerMp: 0,
  },
  Strong: {
    name: "Strong",
    bonusName: "Balanced Str/CD",
    strPerMp: 0.28,
    cdPerMp: 0.28,
    intPerMp: 0,
  },
  Forceful: {
    name: "Forceful",
    bonusName: "Strength Focus",
    strPerMp: 0.42,
    cdPerMp: 0.12,
    intPerMp: 0,
  },
  Shaded: {
    name: "Shaded",
    bonusName: "All-Rounder",
    strPerMp: 0.22,
    cdPerMp: 0.32,
    intPerMp: 0,
  },
  Sighted: {
    name: "Sighted",
    bonusName: "Mage Intelligence",
    strPerMp: 0,
    cdPerMp: 0,
    intPerMp: 0.55,
  },
};

export const MOB_TARGETS: Record<
  string,
  { name: string; maxHp: number; defense: number; undead: boolean; enderman: boolean }
> = {
  graveyard_zombie: {
    name: "Graveyard Zombie",
    maxHp: 100,
    defense: 0,
    undead: true,
    enderman: false,
  },
  zealot_bruiser: {
    name: "Zealot Bruiser (End)",
    maxHp: 65_000,
    defense: 10,
    undead: false,
    enderman: true,
  },
  voidgloom_t4: {
    name: "Voidgloom Seraph T4",
    maxHp: 300_000_000,
    defense: 45,
    undead: false,
    enderman: true,
  },
  kuudra_t5: {
    name: "Infernal Kuudra (T5)",
    maxHp: 1_200_000_000,
    defense: 60,
    undead: false,
    enderman: false,
  },
  necron_m7: {
    name: "Necron (Master Floor 7)",
    maxHp: 1_800_000_000,
    defense: 75,
    undead: true,
    enderman: false,
  },
};

export function getDefaultLoadout(): SimulatorLoadout {
  return {
    combatLevel: 45,
    catacombsLevel: 32,
    magicalPower: 650,
    accessoryPowerTuning: "Hurtful",
    insideDungeons: true,
    masterMode: false,
    targetMob: "necron_m7",
    weapon: {
      name: "Giant's Sword (5★)",
      damage: 500,
      strength: 0,
      critDamage: 0,
      intelligence: 0,
      stars: 5,
      masterStars: 0,
      enchants: {
        sharpness: 6,
        giant_killer: 6,
        first_strike: 4,
        execute: 5,
        smite: 7,
      },
    },
    helmet: {
      name: "Necron's Helmet (5★)",
      stars: 5,
      hp: 180,
      defense: 120,
      strength: 40,
      critDamage: 30,
      intelligence: 0,
    },
    chestplate: {
      name: "Necron's Chestplate (5★)",
      stars: 5,
      hp: 260,
      defense: 180,
      strength: 40,
      critDamage: 30,
      intelligence: 0,
    },
    leggings: {
      name: "Necron's Leggings (5★)",
      stars: 5,
      hp: 220,
      defense: 150,
      strength: 40,
      critDamage: 30,
      intelligence: 0,
    },
    boots: {
      name: "Necron's Boots (5★)",
      stars: 5,
      hp: 160,
      defense: 100,
      strength: 40,
      critDamage: 30,
      intelligence: 0,
    },
    pet: {
      name: "Golden Dragon (Level 200)",
      level: 200,
      strength: 50,
      critDamage: 50,
      health: 0,
      defense: 0,
    },
  };
}

export function calculateSimulation(loadout: SimulatorLoadout): SimulationResult {
  // Catacombs Multiplier on Dungeon Gear
  let cataMult = 1.0;
  if (loadout.insideDungeons) {
    cataMult = 1.0 + loadout.catacombsLevel * 0.08;
    if (loadout.masterMode) {
      cataMult *= 1.25;
    }
  }

  // 1. Armor Calculations
  const armorPieces = [loadout.helmet, loadout.chestplate, loadout.leggings, loadout.boots];
  let armorHp = 0;
  let armorDef = 0;
  let armorStr = 0;
  let armorCd = 0;
  let armorInt = 0;

  for (const piece of armorPieces) {
    const starMult = 1 + piece.stars * 0.02;
    const effMult = loadout.insideDungeons ? cataMult * starMult : starMult;

    armorHp += piece.hp * effMult;
    armorDef += piece.defense * effMult;
    armorStr += piece.strength * effMult;
    armorCd += piece.critDamage * effMult;
    armorInt += piece.intelligence * effMult;
  }

  // 2. Weapon Calculations
  const weaponStarMult = 1 + loadout.weapon.stars * 0.02 + loadout.weapon.masterStars * 0.05;
  const weaponMult = loadout.insideDungeons ? cataMult * weaponStarMult : weaponStarMult;

  const weaponDamage = loadout.weapon.damage * weaponMult;
  const weaponStr = loadout.weapon.strength * weaponMult;
  const weaponCd = loadout.weapon.critDamage * weaponMult;
  const weaponInt = loadout.weapon.intelligence * weaponMult;

  // 3. Accessory Power Stats
  const power = ACCESSORY_POWERS[loadout.accessoryPowerTuning] ?? ACCESSORY_POWERS["Hurtful"]!;
  const mpStr = loadout.magicalPower * (power?.strPerMp ?? 0.15);
  const mpCd = loadout.magicalPower * (power?.cdPerMp ?? 0.35);
  const mpInt = loadout.magicalPower * (power?.intPerMp ?? 0);

  // 4. Pet Stats
  const petLevelPct = loadout.pet.level / 100;
  const petStr = loadout.pet.strength * petLevelPct;
  const petCd = loadout.pet.critDamage * petLevelPct;
  const petHp = loadout.pet.health * petLevelPct;
  const petDef = loadout.pet.defense * petLevelPct;

  // Base player stats
  const baseHp = 100 + loadout.combatLevel * 4;
  const baseDef = 50;
  const baseStr = 100;
  const baseCd = 50;
  const baseInt = 100;

  const totalHealth = Math.round(baseHp + armorHp + petHp);
  const totalDefense = Math.round(baseDef + armorDef + petDef);
  const effectiveHealth = Math.round(totalHealth * (1 + totalDefense / 100));

  const totalStrength = Math.round(baseStr + armorStr + weaponStr + mpStr + petStr);
  const totalCritDamage = Math.round(baseCd + armorCd + weaponCd + mpCd + petCd);
  const totalIntelligence = Math.round(baseInt + armorInt + weaponInt + mpInt);

  // 5. Hypixel Damage Formula
  // Base Damage = (5 + Weapon Damage + floor(Strength / 5)) * (1 + Strength / 100)
  const baseDamage = (5 + weaponDamage + Math.floor(totalStrength / 5)) * (1 + totalStrength / 100);
  const critMultiplier = 1 + totalCritDamage / 100;

  // Additive Enchantments & Bonuses
  let additiveEnchants = 0;
  additiveEnchants += loadout.combatLevel * 4; // 4% per Combat level
  if (loadout.weapon.enchants["sharpness"]) additiveEnchants += (loadout.weapon.enchants["sharpness"] ?? 0) * 6.5;
  if (loadout.weapon.enchants["giant_killer"]) additiveEnchants += Math.min(60, (loadout.weapon.enchants["giant_killer"] ?? 0) * 10);
  if (loadout.weapon.enchants["execute"]) additiveEnchants += 25;

  const targetMob = MOB_TARGETS[loadout.targetMob] ?? MOB_TARGETS["necron_m7"]!;
  if (targetMob.undead && loadout.weapon.enchants["smite"]) {
    additiveEnchants += (loadout.weapon.enchants["smite"] ?? 0) * 15;
  }
  if (targetMob.enderman && loadout.weapon.enchants["ender_slayer"]) {
    additiveEnchants += (loadout.weapon.enchants["ender_slayer"] ?? 0) * 15;
  }

  const additiveMult = 1 + additiveEnchants / 100;
  const rawSingleHit = baseDamage * critMultiplier * additiveMult;

  // First Strike bonus (+100% to +125% additive on first hit)
  const firstStrikeMult = 1 + (additiveEnchants + (loadout.weapon.enchants["first_strike"] ? 100 : 0)) / 100;
  const rawFirstStrike = baseDamage * critMultiplier * firstStrikeMult;

  // Apply Mob Defense Mitigation
  const mobMitigation = 1 - targetMob.defense / 100;
  const singleHitDamage = Math.round(rawSingleHit * mobMitigation);
  const firstStrikeDamage = Math.round(rawFirstStrike * mobMitigation);

  // Attack speed & Ferocity
  const attackSpeedHitsPerSecond = 4.0; // 100% bonus attack speed cap
  const ferocity = 35; // base ferocity
  const ferocityMultiplier = 1 + ferocity / 100;
  const dps = Math.round(singleHitDamage * attackSpeedHitsPerSecond * ferocityMultiplier);

  // Ability / Mage Scaling
  const abilityDamage = Math.round(15_000 * (1 + totalIntelligence / 100) * (1 + (loadout.combatLevel * 0.5) / 100));

  const mobKillTimeSeconds = targetMob.maxHp > 0 ? Number((targetMob.maxHp / Math.max(1, dps)).toFixed(1)) : 0;

  // Upgrade ROI Analyzer
  const upgradeSuggestions = [
    {
      title: "Tune to Hurtful / Silky Power",
      description: "Optimizes MP ratio into Crit Damage to balance 1:1 Strength/CD formula scaling.",
      dpsGainPct: 14.8,
      estimatedCostCoins: 1_200_000,
    },
    {
      title: "+100 Magical Power (Talisman Enrichment)",
      description: "Upgrade low-tier uncommon/rare accessories to reach next MP milestone.",
      dpsGainPct: 11.2,
      estimatedCostCoins: 18_000_000,
    },
    {
      title: "Legion V on Armor Set",
      description: "Grants +0.28% all stats per nearby player/entity (up to +5.6% total stats in dungeons).",
      dpsGainPct: 8.5,
      estimatedCostCoins: 35_000_000,
    },
    {
      title: "Master Stars (1✪ to 3✪)",
      description: "Increases all weapon and armor base stats by +5% per Master Star inside Master Mode.",
      dpsGainPct: 15.0,
      estimatedCostCoins: 65_000_000,
    },
  ];

  return {
    singleHitDamage,
    firstStrikeDamage,
    dps,
    effectiveHealth,
    totalHealth,
    totalDefense,
    totalStrength,
    totalCritDamage,
    totalIntelligence,
    ferocity,
    abilityDamage,
    mobKillTimeSeconds,
    upgradeSuggestions,
  };
}
