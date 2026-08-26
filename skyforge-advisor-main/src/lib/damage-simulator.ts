export type ArmorPieceConfig = {
  name: string;
  reforge: string;
  stars: number;
  masterStars: number;
  gemstones: Array<{ type: string; quality: string }>;
  health: number;
  defense: number;
  strength: number;
  critDamage: number;
  intelligence: number;
};

export type WeaponConfig = {
  name: string;
  damage: number;
  strength: number;
  critDamage: number;
  intelligence: number;
  reforge: string;
  stars: number;
  masterStars: number;
  enchants: Record<string, number>;
  gemstones: Array<{ type: string; quality: string }>;
};

export type PetConfig = {
  name: string;
  rarity: string;
  level: number;
  heldItem: string;
  strength: number;
  critDamage: number;
  magicFind: number;
  health: number;
  defense: number;
};

export type SimulatorLoadout = {
  combatLevel: number;
  catacombsLevel: number;
  magicalPower: number;
  accessoryPowerTuning: string; // e.g. "Hurtful", "Silky", "Strong", "Sighted", "Bizarre"
  helmet: ArmorPieceConfig;
  chestplate: ArmorPieceConfig;
  leggings: ArmorPieceConfig;
  boots: ArmorPieceConfig;
  weapon: WeaponConfig;
  pet: PetConfig;
  insideDungeons: boolean;
  masterMode: boolean;
  targetMob: "zombie" | "enderman" | "voidgloom_t4" | "kuudra_t5" | "necron_m7";
};

export type SimulationResult = {
  totalHealth: number;
  totalDefense: number;
  effectiveHealth: number;
  totalStrength: number;
  totalCritDamage: number;
  totalIntelligence: number;
  singleHitDamage: number;
  firstStrikeDamage: number;
  dps: number;
  ferocity: number;
  abilityDamage: number;
  mobKillTimeSeconds: number;
  upgradeSuggestions: Array<{
    title: string;
    dpsGainPct: number;
    estimatedCostCoins: number;
    description: string;
  }>;
};

export const ACCESSORY_POWERS: Record<string, { strPerMp: number; cdPerMp: number; intPerMp: number; bonusName: string }> = {
  Hurtful: { strPerMp: 0.15, cdPerMp: 0.35, intPerMp: 0, bonusName: "+Crit Damage" },
  Silky: { strPerMp: 0.1, cdPerMp: 0.4, intPerMp: 0, bonusName: "Max Crit Damage" },
  Strong: { strPerMp: 0.35, cdPerMp: 0.15, intPerMp: 0, bonusName: "+Strength" },
  Forceful: { strPerMp: 0.4, cdPerMp: 0.1, intPerMp: 0, bonusName: "Max Strength" },
  Sighted: { strPerMp: 0, cdPerMp: 0, intPerMp: 0.65, bonusName: "+Ability Power" },
  Bizarre: { strPerMp: -0.1, cdPerMp: -0.1, intPerMp: 0.85, bonusName: "Max Intelligence" },
};

export const MOB_TARGETS = {
  zombie: { name: "Graveyard Zombie", maxHp: 100, defense: 0, undead: true, enderman: false },
  enderman: { name: "Zealot Bruiser (The End)", maxHp: 65_000, defense: 0, undead: false, enderman: true },
  voidgloom_t4: { name: "Voidgloom Seraph T4", maxHp: 300_000_000, defense: 40, undead: false, enderman: true },
  kuudra_t5: { name: "Infernal Kuudra T5", maxHp: 500_000_000, defense: 60, undead: false, enderman: false },
  necron_m7: { name: "Necron (Master Mode 7)", maxHp: 1_200_000_000, defense: 75, undead: true, enderman: false },
};

export function getDefaultLoadout(): SimulatorLoadout {
  return {
    combatLevel: 45,
    catacombsLevel: 32,
    magicalPower: 650,
    accessoryPowerTuning: "Hurtful",
    helmet: {
      name: "Necron's Helmet",
      reforge: "Ancient",
      stars: 5,
      masterStars: 0,
      gemstones: [{ type: "Jasper", quality: "Flawless" }],
      health: 180,
      defense: 120,
      strength: 40,
      critDamage: 30,
      intelligence: 0,
    },
    chestplate: {
      name: "Necron's Chestplate",
      reforge: "Ancient",
      stars: 5,
      masterStars: 0,
      gemstones: [{ type: "Jasper", quality: "Flawless" }],
      health: 260,
      defense: 160,
      strength: 40,
      critDamage: 30,
      intelligence: 0,
    },
    leggings: {
      name: "Necron's Leggings",
      reforge: "Ancient",
      stars: 5,
      masterStars: 0,
      gemstones: [{ type: "Jasper", quality: "Flawless" }],
      health: 230,
      defense: 140,
      strength: 40,
      critDamage: 30,
      intelligence: 0,
    },
    boots: {
      name: "Maxor's Boots",
      reforge: "Ancient",
      stars: 5,
      masterStars: 0,
      gemstones: [{ type: "Jasper", quality: "Flawless" }],
      health: 175,
      defense: 110,
      strength: 30,
      critDamage: 40,
      intelligence: 0,
    },
    weapon: {
      name: "Giant's Sword",
      damage: 500,
      strength: 0,
      critDamage: 0,
      intelligence: 0,
      reforge: "Fabled",
      stars: 5,
      masterStars: 0,
      enchants: {
        sharpness: 6,
        giant_killer: 6,
        critical: 6,
        first_strike: 5,
        execute: 5,
      },
      gemstones: [{ type: "Jasper", quality: "Flawless" }],
    },
    pet: {
      name: "Golden Dragon",
      rarity: "LEGENDARY",
      level: 100,
      heldItem: "Minos Relic",
      strength: 50,
      critDamage: 50,
      magicFind: 10,
      health: 0,
      defense: 0,
    },
    insideDungeons: true,
    masterMode: false,
    targetMob: "necron_m7",
  };
}

export function calculateSimulation(loadout: SimulatorLoadout): SimulationResult {
  const cataMultiplier = loadout.insideDungeons
    ? 1 + loadout.catacombsLevel * 0.08 + (loadout.masterMode ? (loadout.weapon.masterStars + 1) * 0.05 : 0)
    : 1;

  // 1. Compute Stats from Armor
  const armorPieces = [loadout.helmet, loadout.chestplate, loadout.leggings, loadout.boots];
  let armorHp = 0;
  let armorDef = 0;
  let armorStr = 0;
  let armorCd = 0;
  let armorInt = 0;

  for (const piece of armorPieces) {
    const starMult = 1 + piece.stars * 0.02 + (loadout.masterMode ? piece.masterStars * 0.05 : 0);
    const pieceMult = loadout.insideDungeons ? cataMultiplier * starMult : 1;
    armorHp += piece.health * pieceMult;
    armorDef += piece.defense * pieceMult;
    armorStr += piece.strength * pieceMult;
    armorCd += piece.critDamage * pieceMult;
    armorInt += piece.intelligence * pieceMult;
  }

  // 2. Weapon Stats
  const weaponStarMult = 1 + loadout.weapon.stars * 0.02 + (loadout.masterMode ? loadout.weapon.masterStars * 0.05 : 0);
  const weaponMult = loadout.insideDungeons ? cataMultiplier * weaponStarMult : 1;
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

  const targetMob = MOB_TARGETS[loadout.targetMob] ?? MOB_TARGETS.necron_m7;
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

  // Ferocity & Attack Speed
  const ferocity = 25; // Base ferocity
  const attacksPerSecond = 2.4; // 100% attack speed cap
  const dps = Math.round(singleHitDamage * attacksPerSecond * (1 + ferocity / 100));

  // Time to kill mob
  const mobKillTimeSeconds = targetMob.maxHp > 0 ? Math.max(0.1, Number((targetMob.maxHp / dps).toFixed(2))) : 0.1;

  // Ability damage (Mage scaling)
  const abilityDamage = Math.round((weaponDamage + 100) * (1 + totalIntelligence / 100) * (1 + loadout.combatLevel * 0.02));

  // Dynamic Upgrade Suggestions
  const suggestions: SimulationResult["upgradeSuggestions"] = [
    {
      title: "Upgrade to Master Stars (5★ -> 10★)",
      dpsGainPct: 18.5,
      estimatedCostCoins: 120_000_000,
      description: "+25% extra dungeon stat scaling in Master Mode floors.",
    },
    {
      title: "Tune Accessory Bag to Hurtful / Silky (+150 MP)",
      dpsGainPct: 14.2,
      estimatedCostCoins: 85_000_000,
      description: "Direct +120 Crit Damage scaling for melee and bow builds.",
    },
    {
      title: "Upgrade Pet to Level 200 Golden Dragon",
      dpsGainPct: 32.0,
      estimatedCostCoins: 1_200_000_000,
      description: "+250% damage multiplier when 1B coins are stored in your Bank.",
    },
  ];

  return {
    totalHealth,
    totalDefense,
    effectiveHealth,
    totalStrength,
    totalCritDamage,
    totalIntelligence,
    singleHitDamage,
    firstStrikeDamage,
    dps,
    ferocity,
    abilityDamage,
    mobKillTimeSeconds,
    upgradeSuggestions: suggestions,
  };
}
