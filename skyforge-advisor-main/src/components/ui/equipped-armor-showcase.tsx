"use client";

import React from "react";
import { Shield, Sparkles } from "lucide-react";
import { ItemIcon } from "@/components/ui/item-icon";
import { MinecraftTooltip } from "@/components/ui/minecraft-tooltip";
import { CharacterCanvas } from "@/components/ui/character-canvas";
import { cn } from "@/lib/utils";
import type { InventoryItem } from "@/lib/skyblock";

export type EquippedArmorShowcaseProps = {
  uuid?: string | undefined;
  username?: string | undefined;
  armorItems?: InventoryItem[] | undefined;
  equipmentItems?: InventoryItem[] | undefined;
  activeWeapon?: InventoryItem | undefined;
  className?: string;
};

export function EquippedArmorShowcase({
  uuid,
  username,
  armorItems = [],
  equipmentItems = [],
  activeWeapon,
  className,
}: EquippedArmorShowcaseProps) {
  // Find equipped armor by slot or keyword
  // In vanilla/Hypixel: Slot 3 = Helmet, Slot 2 = Chestplate, Slot 1 = Leggings, Slot 0 = Boots
  const helmet =
    armorItems.find(
      (i) =>
        i.slot === 3 ||
        i.name.toLowerCase().includes("helmet") ||
        i.name.toLowerCase().includes("crown") ||
        i.name.toLowerCase().includes("head") ||
        i.name.toLowerCase().includes("goggles") ||
        i.name.toLowerCase().includes("fedora") ||
        i.name.toLowerCase().includes("mask") ||
        i.name.toLowerCase().includes("hood") ||
        i.name.toLowerCase().includes("cap")
    ) || null;

  const chestplate =
    armorItems.find(
      (i) =>
        i.slot === 2 ||
        i.name.toLowerCase().includes("chestplate") ||
        i.name.toLowerCase().includes("tunic") ||
        i.name.toLowerCase().includes("shirt") ||
        i.name.toLowerCase().includes("jacket") ||
        i.name.toLowerCase().includes("cloak") ||
        i.name.toLowerCase().includes("tuxedo")
    ) || null;

  const leggings =
    armorItems.find(
      (i) =>
        i.slot === 1 ||
        i.name.toLowerCase().includes("leggings") ||
        i.name.toLowerCase().includes("pants") ||
        i.name.toLowerCase().includes("trousers")
    ) || null;

  const boots =
    armorItems.find(
      (i) =>
        i.slot === 0 ||
        i.name.toLowerCase().includes("boots") ||
        i.name.toLowerCase().includes("shoes") ||
        i.name.toLowerCase().includes("sandals")
    ) || null;

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/10 bg-slate-950/85 p-4 shadow-2xl backdrop-blur-xl overflow-hidden",
        className
      )}
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-emerald-500/10 blur-2xl" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-emerald-400" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-white">
            Equipped Character
          </h3>
        </div>
        <span className="font-mono text-[10px] text-white/50">{username ?? "Player"}</span>
      </div>

      {/* 3D Character Canvas Flanked by Armor Slots */}
      <div className="mt-3 flex items-center justify-between gap-2">
        {/* Left Side: Helmet & Chestplate */}
        <div className="flex flex-col gap-2">
          {/* Helmet Slot */}
          <ArmorSlotCard item={helmet} label="Helmet" defaultIcon="🪖" />

          {/* Chestplate Slot */}
          <ArmorSlotCard item={chestplate} label="Chestplate" defaultIcon="🥋" />
        </div>

        {/* Center: 3D Animated Character Model with Equipped 3D Armor */}
        <div className="flex flex-1 items-center justify-center">
          <CharacterCanvas
            uuid={uuid}
            username={username}
            armorItems={armorItems}
            width={140}
            height={180}
            className="w-full"
          />
        </div>

        {/* Right Side: Leggings & Boots */}
        <div className="flex flex-col gap-2">
          {/* Leggings Slot */}
          <ArmorSlotCard item={leggings} label="Leggings" defaultIcon="👖" />

          {/* Boots Slot */}
          <ArmorSlotCard item={boots} label="Boots" defaultIcon="👢" />
        </div>
      </div>
    </div>
  );
}

function ArmorSlotCard({
  item,
  label,
  defaultIcon,
}: {
  item: InventoryItem | null;
  label: string;
  defaultIcon: string;
}) {
  if (!item) {
    return (
      <div
        className="flex size-11 items-center justify-center rounded-xl border border-white/5 bg-black/40 text-base opacity-40 select-none"
        title={`No ${label} equipped`}
      >
        <span className="grayscale">{defaultIcon}</span>
      </div>
    );
  }

  return (
    <MinecraftTooltip name={item.name} rarity={item.rarity} lore={item.lore}>
      <div className="group relative flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] p-1 shadow-inner transition-none hover:border-emerald-400/80 hover:bg-white/[0.08] cursor-pointer">
        <ItemIcon id={item.id} name={item.name} className="size-8 object-contain" />
        {item.count > 1 && (
          <span className="absolute bottom-0.5 right-1 font-mono text-[9px] font-bold text-white drop-shadow">
            {item.count}
          </span>
        )}
      </div>
    </MinecraftTooltip>
  );
}
