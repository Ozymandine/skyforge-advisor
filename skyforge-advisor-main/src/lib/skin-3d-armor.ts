// src/lib/skin-3d-armor.ts
// Attaches authentic 3D Minecraft Armor Meshes (Helmet with open visor,
// Chestplate with shoulder pauldrons, Leggings with belt/greaves, and Boots)
// onto skinview3d PlayerObject skeletal parts in Three.js WebGL space.

import * as THREE from "three";
import type { InventoryItem } from "@/lib/skyblock";

const ARMOR_GROUP_NAME = "__skyforge_3d_armor__";

export type ArmorMaterialConfig = {
  color: number;
  emissive: number;
  metalness: number;
  roughness: number;
};

// Known SkyBlock & Vanilla armor color definitions with authentic trim/emissive highlights
const ARMOR_CONFIGS: Record<string, ArmorMaterialConfig> = {
  shadow_assassin: {
    color: 0x221c2e,
    emissive: 0x3d1466,
    metalness: 0.6,
    roughness: 0.3,
  },
  necron: {
    color: 0x9b2323,
    emissive: 0x4a0a0a,
    metalness: 0.5,
    roughness: 0.35,
  },
  crimson: {
    color: 0x8a1c1c,
    emissive: 0x3d0808,
    metalness: 0.5,
    roughness: 0.35,
  },
  storm: {
    color: 0x1c7a9b,
    emissive: 0x0a364a,
    metalness: 0.5,
    roughness: 0.3,
  },
  aurora: {
    color: 0x288a96,
    emissive: 0x0e454d,
    metalness: 0.5,
    roughness: 0.3,
  },
  maxor: {
    color: 0x7b229b,
    emissive: 0x420d57,
    metalness: 0.5,
    roughness: 0.3,
  },
  goldor: {
    color: 0x4a5054,
    emissive: 0x1a1e21,
    metalness: 0.6,
    roughness: 0.35,
  },
  terror: {
    color: 0x282b2e,
    emissive: 0x14181a,
    metalness: 0.6,
    roughness: 0.4,
  },
  superior: {
    color: 0xd4af37,
    emissive: 0x4a3a0a,
    metalness: 0.7,
    roughness: 0.25,
  },
  divan: {
    color: 0xf5d061,
    emissive: 0x5c4c10,
    metalness: 0.8,
    roughness: 0.2,
  },
  frozen_blaze: {
    color: 0x54b8e0,
    emissive: 0x1a4e63,
    metalness: 0.5,
    roughness: 0.2,
  },
  diamond: {
    color: 0x4bedd7,
    emissive: 0x125249,
    metalness: 0.6,
    roughness: 0.25,
  },
  perfect: {
    color: 0x4bedd7,
    emissive: 0x125249,
    metalness: 0.7,
    roughness: 0.2,
  },
  netherite: {
    color: 0x403a3f,
    emissive: 0x1c171b,
    metalness: 0.6,
    roughness: 0.35,
  },
  iron: {
    color: 0xd8d8d8,
    emissive: 0x222222,
    metalness: 0.5,
    roughness: 0.3,
  },
  gold: {
    color: 0xe8c838,
    emissive: 0x4a3f0d,
    metalness: 0.7,
    roughness: 0.2,
  },
  leather: {
    color: 0x8b542e,
    emissive: 0x1f1006,
    metalness: 0.1,
    roughness: 0.8,
  },
};

function getArmorMaterial(item: InventoryItem | null | undefined): THREE.MeshStandardMaterial {
  if (!item) {
    return new THREE.MeshStandardMaterial({
      color: 0x4bedd7,
      emissive: 0x125249,
      metalness: 0.6,
      roughness: 0.3,
    });
  }

  const name = item.name.toLowerCase();
  for (const [key, conf] of Object.entries(ARMOR_CONFIGS)) {
    if (name.includes(key.replace(/_/g, " ")) || name.includes(key)) {
      return new THREE.MeshStandardMaterial({
        color: conf.color,
        emissive: conf.emissive,
        metalness: conf.metalness,
        roughness: conf.roughness,
      });
    }
  }

  // Fallbacks by keywords
  if (name.includes("dragon")) {
    return new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      emissive: 0x4a3a0a,
      metalness: 0.7,
      roughness: 0.25,
    });
  }
  if (name.includes("wither")) {
    return new THREE.MeshStandardMaterial({
      color: 0x9b2323,
      emissive: 0x4a0a0a,
      metalness: 0.5,
      roughness: 0.35,
    });
  }
  if (name.includes("diamond")) {
    return new THREE.MeshStandardMaterial({
      color: 0x4bedd7,
      emissive: 0x125249,
      metalness: 0.6,
      roughness: 0.25,
    });
  }
  if (name.includes("iron")) {
    return new THREE.MeshStandardMaterial({
      color: 0xd8d8d8,
      emissive: 0x222222,
      metalness: 0.5,
      roughness: 0.3,
    });
  }

  return new THREE.MeshStandardMaterial({
    color: 0x4bedd7,
    emissive: 0x125249,
    metalness: 0.6,
    roughness: 0.3,
  });
}

/**
 * Attaches authentic 3D armor meshes directly to the skinview3d PlayerObject body parts.
 */
export function apply3DArmor(viewer: any, armorItems: InventoryItem[] = []) {
  if (!viewer || !viewer.playerObject || !viewer.playerObject.skin) return;

  const skin = viewer.playerObject.skin;

  // Clean up any previously attached armor meshes
  remove3DArmor(viewer);

  // Find equipped items
  const helmetItem = armorItems.find(
    (i) =>
      i.slot === 3 ||
      i.name.toLowerCase().includes("helmet") ||
      i.name.toLowerCase().includes("crown") ||
      i.name.toLowerCase().includes("head") ||
      i.name.toLowerCase().includes("goggles") ||
      i.name.toLowerCase().includes("mask")
  );

  const chestplateItem = armorItems.find(
    (i) =>
      i.slot === 2 ||
      i.name.toLowerCase().includes("chestplate") ||
      i.name.toLowerCase().includes("tunic") ||
      i.name.toLowerCase().includes("jacket") ||
      i.name.toLowerCase().includes("cloak")
  );

  const leggingsItem = armorItems.find(
    (i) =>
      i.slot === 1 ||
      i.name.toLowerCase().includes("leggings") ||
      i.name.toLowerCase().includes("pants")
  );

  const bootsItem = armorItems.find(
    (i) =>
      i.slot === 0 ||
      i.name.toLowerCase().includes("boots") ||
      i.name.toLowerCase().includes("shoes")
  );

  // 1. 3D HELMET WITH OPEN VISOR (Attached to head bone)
  if (helmetItem && skin.head) {
    const helmetMat = getArmorMaterial(helmetItem);
    const helmetGroup = new THREE.Group();
    helmetGroup.name = ARMOR_GROUP_NAME;

    // Top Crown Plate
    const topGeo = new THREE.BoxGeometry(8.9, 1.2, 8.9);
    const topMesh = new THREE.Mesh(topGeo, helmetMat);
    topMesh.position.set(0, 8.1, 0);
    helmetGroup.add(topMesh);

    // Back Skull Plate
    const backGeo = new THREE.BoxGeometry(8.9, 7.8, 1.2);
    const backMesh = new THREE.Mesh(backGeo, helmetMat);
    backMesh.position.set(0, 4.1, -4.1);
    helmetGroup.add(backMesh);

    // Left Ear / Jaw Plate
    const leftGeo = new THREE.BoxGeometry(1.2, 7.8, 8.9);
    const leftMesh = new THREE.Mesh(leftGeo, helmetMat);
    leftMesh.position.set(4.1, 4.1, 0);
    helmetGroup.add(leftMesh);

    // Right Ear / Jaw Plate
    const rightGeo = new THREE.BoxGeometry(1.2, 7.8, 8.9);
    const rightMesh = new THREE.Mesh(rightGeo, helmetMat);
    rightMesh.position.set(-4.1, 4.1, 0);
    helmetGroup.add(rightMesh);

    // Forehead Visor Rim
    const foreheadGeo = new THREE.BoxGeometry(8.9, 2.0, 1.2);
    const foreheadMesh = new THREE.Mesh(foreheadGeo, helmetMat);
    foreheadMesh.position.set(0, 7.2, 4.1);
    helmetGroup.add(foreheadMesh);

    // Nose Guard
    const noseGeo = new THREE.BoxGeometry(1.4, 2.8, 1.2);
    const noseMesh = new THREE.Mesh(noseGeo, helmetMat);
    noseMesh.position.set(0, 5.2, 4.2);
    helmetGroup.add(noseMesh);

    skin.head.add(helmetGroup);
  }

  // 2. 3D CHESTPLATE WITH PAULDRONS (Attached to body and arms)
  if (chestplateItem) {
    const chestMat = getArmorMaterial(chestplateItem);

    // Torso Breastplate
    if (skin.body) {
      const bodyArmorGroup = new THREE.Group();
      bodyArmorGroup.name = ARMOR_GROUP_NAME;

      const chestGeo = new THREE.BoxGeometry(8.7, 10.8, 4.7);
      const chestMesh = new THREE.Mesh(chestGeo, chestMat);
      chestMesh.position.set(0, 0.5, 0);
      bodyArmorGroup.add(chestMesh);
      skin.body.add(bodyArmorGroup);
    }

    // Right Shoulder Pauldron (Upper Arm)
    if (skin.rightArm) {
      const rArmGroup = new THREE.Group();
      rArmGroup.name = ARMOR_GROUP_NAME;

      const rShoulderGeo = new THREE.BoxGeometry(4.7, 5.5, 4.7);
      const rShoulderMesh = new THREE.Mesh(rShoulderGeo, chestMat);
      rShoulderMesh.position.set(0, -1.8, 0);
      rArmGroup.add(rShoulderMesh);

      // Vambrace (Forearm)
      const rVambraceGeo = new THREE.BoxGeometry(4.5, 3.8, 4.5);
      const rVambraceMesh = new THREE.Mesh(rVambraceGeo, chestMat);
      rVambraceMesh.position.set(0, -5.2, 0);
      rArmGroup.add(rVambraceMesh);

      skin.rightArm.add(rArmGroup);
    }

    // Left Shoulder Pauldron (Upper Arm)
    if (skin.leftArm) {
      const lArmGroup = new THREE.Group();
      lArmGroup.name = ARMOR_GROUP_NAME;

      const lShoulderGeo = new THREE.BoxGeometry(4.7, 5.5, 4.7);
      const lShoulderMesh = new THREE.Mesh(lShoulderGeo, chestMat);
      lShoulderMesh.position.set(0, -1.8, 0);
      lArmGroup.add(lShoulderMesh);

      // Vambrace (Forearm)
      const lVambraceGeo = new THREE.BoxGeometry(4.5, 3.8, 4.5);
      const lVambraceMesh = new THREE.Mesh(lVambraceGeo, chestMat);
      lVambraceMesh.position.set(0, -5.2, 0);
      lArmGroup.add(lVambraceMesh);

      skin.leftArm.add(lArmGroup);
    }
  }

  // 3. 3D LEGGINGS WITH BELT & GREAVES (Attached to body and legs)
  if (leggingsItem) {
    const legsMat = getArmorMaterial(leggingsItem);

    // Belt / Waist guard on lower body
    if (skin.body) {
      const beltGroup = new THREE.Group();
      beltGroup.name = ARMOR_GROUP_NAME;

      const beltGeo = new THREE.BoxGeometry(8.6, 2.6, 4.6);
      const beltMesh = new THREE.Mesh(beltGeo, legsMat);
      beltMesh.position.set(0, -5.0, 0);
      beltGroup.add(beltMesh);
      skin.body.add(beltGroup);
    }

    // Right Leg Greaves (Upper Thigh to Knee)
    if (skin.rightLeg) {
      const rLegGroup = new THREE.Group();
      rLegGroup.name = ARMOR_GROUP_NAME;

      const rGreaveGeo = new THREE.BoxGeometry(4.5, 7.2, 4.5);
      const rGreaveMesh = new THREE.Mesh(rGreaveGeo, legsMat);
      rGreaveMesh.position.set(0, -3.2, 0);
      rLegGroup.add(rGreaveMesh);
      skin.rightLeg.add(rLegGroup);
    }

    // Left Leg Greaves (Upper Thigh to Knee)
    if (skin.leftLeg) {
      const lLegGroup = new THREE.Group();
      lLegGroup.name = ARMOR_GROUP_NAME;

      const lGreaveGeo = new THREE.BoxGeometry(4.5, 7.2, 4.5);
      const lGreaveMesh = new THREE.Mesh(lGreaveGeo, legsMat);
      lGreaveMesh.position.set(0, -3.2, 0);
      lLegGroup.add(lGreaveMesh);
      skin.leftLeg.add(lLegGroup);
    }
  }

  // 4. 3D BOOTS / SABATONS (Attached to lower feet)
  if (bootsItem) {
    const bootsMat = getArmorMaterial(bootsItem);

    // Right Boot
    if (skin.rightLeg) {
      const rBootGroup = new THREE.Group();
      rBootGroup.name = ARMOR_GROUP_NAME;

      const rBootGeo = new THREE.BoxGeometry(4.7, 4.2, 4.7);
      const rBootMesh = new THREE.Mesh(rBootGeo, bootsMat);
      rBootMesh.position.set(0, -8.6, 0);
      rBootGroup.add(rBootMesh);
      skin.rightLeg.add(rBootGroup);
    }

    // Left Boot
    if (skin.leftLeg) {
      const lBootGroup = new THREE.Group();
      lBootGroup.name = ARMOR_GROUP_NAME;

      const lBootGeo = new THREE.BoxGeometry(4.7, 4.2, 4.7);
      const lBootMesh = new THREE.Mesh(lBootGeo, bootsMat);
      lBootMesh.position.set(0, -8.6, 0);
      lBootGroup.add(lBootMesh);
      skin.leftLeg.add(lBootGroup);
    }
  }
}

/**
 * Removes 3D armor groups from all body parts.
 */
export function remove3DArmor(viewer: any) {
  if (!viewer || !viewer.playerObject || !viewer.playerObject.skin) return;

  const skin = viewer.playerObject.skin;
  const parts = [skin.head, skin.body, skin.rightArm, skin.leftArm, skin.rightLeg, skin.leftLeg];

  for (const part of parts) {
    if (!part) continue;
    const toRemove: THREE.Object3D[] = [];
    part.traverse((child: any) => {
      if (child.name === ARMOR_GROUP_NAME) {
        toRemove.push(child);
      }
    });
    for (const obj of toRemove) {
      if (obj.parent) {
        obj.parent.remove(obj);
      }
    }
  }
}
