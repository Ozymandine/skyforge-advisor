// src/lib/skin-3d-armor.ts
// Attaches animated 3D Minecraft Armor Meshes (Helmet, Chestplate, Leggings, Boots)
// onto skinview3d PlayerObject body parts in Three.js WebGL space.

import * as THREE from "three";
import type { InventoryItem } from "@/lib/skyblock";

const ARMOR_GROUP_NAME = "__skyforge_3d_armor__";

// SkyBlock & Vanilla armor color definitions
const COLOR_MAP: Record<string, { color: number; metalness: number; roughness: number }> = {
  necron: { color: 0x9b2323, metalness: 0.35, roughness: 0.4 },
  crimson: { color: 0x8a1c1c, metalness: 0.35, roughness: 0.4 },
  storm: { color: 0x1c7a9b, metalness: 0.4, roughness: 0.35 },
  aurora: { color: 0x288a96, metalness: 0.4, roughness: 0.35 },
  maxor: { color: 0x7b229b, metalness: 0.4, roughness: 0.35 },
  goldor: { color: 0x3e4245, metalness: 0.5, roughness: 0.4 },
  terror: { color: 0x202224, metalness: 0.5, roughness: 0.5 },
  superior: { color: 0xd4af37, metalness: 0.6, roughness: 0.25 },
  divan: { color: 0xf5d061, metalness: 0.7, roughness: 0.2 },
  shadow_assassin: { color: 0x18141f, metalness: 0.6, roughness: 0.3 },
  frozen_blaze: { color: 0x54b8e0, metalness: 0.5, roughness: 0.2 },
  diamond: { color: 0x4bedd7, metalness: 0.5, roughness: 0.25 },
  perfect: { color: 0x4bedd7, metalness: 0.6, roughness: 0.2 },
  netherite: { color: 0x3d383c, metalness: 0.6, roughness: 0.35 },
  iron: { color: 0xd8d8d8, metalness: 0.5, roughness: 0.3 },
  gold: { color: 0xe8c838, metalness: 0.7, roughness: 0.2 },
  leather: { color: 0x8b542e, metalness: 0.05, roughness: 0.8 },
};

function getArmorMaterial(item: InventoryItem | null | undefined): THREE.MeshStandardMaterial {
  if (!item) {
    return new THREE.MeshStandardMaterial({
      color: 0x4bedd7,
      metalness: 0.5,
      roughness: 0.3,
    });
  }

  const name = item.name.toLowerCase();
  for (const [key, conf] of Object.entries(COLOR_MAP)) {
    if (name.includes(key.replace(/_/g, " ")) || name.includes(key)) {
      return new THREE.MeshStandardMaterial({
        color: conf.color,
        metalness: conf.metalness,
        roughness: conf.roughness,
      });
    }
  }

  // Fallbacks by keywords
  if (name.includes("dragon")) {
    return new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6, roughness: 0.25 });
  }
  if (name.includes("wither")) {
    return new THREE.MeshStandardMaterial({ color: 0x9b2323, metalness: 0.4, roughness: 0.4 });
  }
  if (name.includes("diamond")) {
    return new THREE.MeshStandardMaterial({ color: 0x4bedd7, metalness: 0.5, roughness: 0.25 });
  }
  if (name.includes("iron")) {
    return new THREE.MeshStandardMaterial({ color: 0xd8d8d8, metalness: 0.5, roughness: 0.3 });
  }

  return new THREE.MeshStandardMaterial({
    color: 0x4bedd7,
    metalness: 0.5,
    roughness: 0.3,
  });
}

/**
 * Attaches 3D armor meshes directly to the skinview3d PlayerObject body parts.
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

  // 1. 3D HELMET (Attached to head)
  if (helmetItem && skin.head) {
    const helmetMat = getArmorMaterial(helmetItem);
    const helmetGroup = new THREE.Group();
    helmetGroup.name = ARMOR_GROUP_NAME;

    // Crown & Cap (Top, Sides, Back)
    const crownGeo = new THREE.BoxGeometry(9.4, 9.4, 9.4);
    const crownMesh = new THREE.Mesh(crownGeo, helmetMat);
    crownMesh.position.y = 4.2;

    helmetGroup.add(crownMesh);
    skin.head.add(helmetGroup);
  }

  // 2. 3D CHESTPLATE (Attached to body and arms)
  if (chestplateItem) {
    const chestMat = getArmorMaterial(chestplateItem);

    // Body Breastplate
    if (skin.body) {
      const bodyArmorGroup = new THREE.Group();
      bodyArmorGroup.name = ARMOR_GROUP_NAME;

      const chestGeo = new THREE.BoxGeometry(8.9, 12.4, 4.9);
      const chestMesh = new THREE.Mesh(chestGeo, chestMat);
      bodyArmorGroup.add(chestMesh);
      skin.body.add(bodyArmorGroup);
    }

    // Right Shoulder Pauldron
    if (skin.rightArm) {
      const rArmGroup = new THREE.Group();
      rArmGroup.name = ARMOR_GROUP_NAME;

      const rArmGeo = new THREE.BoxGeometry(4.9, 12.4, 4.9);
      const rArmMesh = new THREE.Mesh(rArmGeo, chestMat);
      rArmMesh.position.y = -4;
      rArmGroup.add(rArmMesh);
      skin.rightArm.add(rArmGroup);
    }

    // Left Shoulder Pauldron
    if (skin.leftArm) {
      const lArmGroup = new THREE.Group();
      lArmGroup.name = ARMOR_GROUP_NAME;

      const lArmGeo = new THREE.BoxGeometry(4.9, 12.4, 4.9);
      const lArmMesh = new THREE.Mesh(lArmGeo, chestMat);
      lArmMesh.position.y = -4;
      lArmGroup.add(lArmMesh);
      skin.leftArm.add(lArmGroup);
    }
  }

  // 3. 3D LEGGINGS (Attached to legs)
  if (leggingsItem) {
    const legsMat = getArmorMaterial(leggingsItem);

    // Right Leg Pants (Upper leg)
    if (skin.rightLeg) {
      const rLegGroup = new THREE.Group();
      rLegGroup.name = ARMOR_GROUP_NAME;

      const rLegGeo = new THREE.BoxGeometry(4.7, 8.5, 4.7);
      const rLegMesh = new THREE.Mesh(rLegGeo, legsMat);
      rLegMesh.position.y = -4.2;
      rLegGroup.add(rLegMesh);
      skin.rightLeg.add(rLegGroup);
    }

    // Left Leg Pants (Upper leg)
    if (skin.leftLeg) {
      const lLegGroup = new THREE.Group();
      lLegGroup.name = ARMOR_GROUP_NAME;

      const lLegGeo = new THREE.BoxGeometry(4.7, 8.5, 4.7);
      const lLegMesh = new THREE.Mesh(lLegGeo, legsMat);
      lLegMesh.position.y = -4.2;
      lLegGroup.add(lLegMesh);
      skin.leftLeg.add(lLegGroup);
    }
  }

  // 4. 3D BOOTS (Attached to lower legs/feet)
  if (bootsItem) {
    const bootsMat = getArmorMaterial(bootsItem);

    // Right Boot
    if (skin.rightLeg) {
      const rBootGroup = new THREE.Group();
      rBootGroup.name = ARMOR_GROUP_NAME;

      const rBootGeo = new THREE.BoxGeometry(4.9, 4.8, 4.9);
      const rBootMesh = new THREE.Mesh(rBootGeo, bootsMat);
      rBootMesh.position.y = -9.6;
      rBootGroup.add(rBootMesh);
      skin.rightLeg.add(rBootGroup);
    }

    // Left Boot
    if (skin.leftLeg) {
      const lBootGroup = new THREE.Group();
      lBootGroup.name = ARMOR_GROUP_NAME;

      const lBootGeo = new THREE.BoxGeometry(4.9, 4.8, 4.9);
      const lBootMesh = new THREE.Mesh(lBootGeo, bootsMat);
      lBootMesh.position.y = -9.6;
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

