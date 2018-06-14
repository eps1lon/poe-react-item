import * as React from 'react';
import { storiesOf } from '@storybook/react';
import {
  Item,
  ArmourProperties,
  WeaponProperties,
  createItems,
  createMods,
  Container,
} from 'poe-mods';
import { Format } from 'poe-i18n';
// 'poe-components-item'
import { Popup, Rarity } from '../../src/';

// tslint:disable: no-var-requires
const items = createItems(require('poe-mods/data/items/equipment.json'));
const mods = createMods([
  ...require('poe-mods/data/mods/prefixes.json'),
  ...require('poe-mods/data/mods/suffixes.json'),
]);
const i18n = {
  base_item_types: require('poe-i18n/locale-data/en/BaseItemTypes.json'),
  datas: {
    stat_descriptions: require('poe-i18n/locale-data/en/stat_descriptions.json'),
  },
};

const base_helmet: Item = items.fromId(
  'Metadata/Items/Armours/Helmets/HelmetInt11',
);
const helmet = base_helmet.rarity
  .set('rare')
  .asShaperItem()
  .addMod(mods.fromId('IncreasedLife0'))
  .addMod(mods.fromId('LocalIncreasedEnergyShield2'))
  .addMod(mods.fromId('LocalIncreasedEnergyShieldPercentAndStunRecovery3'))
  .addMod(mods.fromId('FireResist1'))
  .addMod(mods.fromId('ReducedLocalAttributeRequirements1'))
  .addMod(mods.fromId('AdditionalMinesPlacedSupportedUber1_'));

const dagger: Item = items
  .fromId('Metadata/Items/Weapons/OneHandWeapons/Daggers/Dagger20')
  .rarity.set('rare')
  .asElderItem()
  .addMod(mods.fromId('LocalAddedChaosDamage1'))
  .addMod(mods.fromId('LocalIncreasedPhysicalDamagePercent7'))
  .addMod(mods.fromId('LocalAddedColdDamage1'))
  .addMod(mods.fromId('LocalIncreasedAttackSpeed8'))
  .addMod(mods.fromId('LocalCriticalStrikeChance5'))
  .setProperty('corrupted', true);

const snapshotProperties = (item: Item) => {
  const { properties } = item;
  const base_properties = {
    quality: properties.quality,
  };

  if (properties instanceof ArmourProperties) {
    return {
      ...base_properties,
      ...properties.defences(),
    };
  } else if (properties instanceof WeaponProperties) {
    const physical_damage = properties.physical_damage();
    const cold_damage = properties.cold_damage();

    return {
      ...base_properties,
      physical_damage: {
        augmented:
          physical_damage.min.augmented || physical_damage.max.augmented,
        value: [physical_damage.min.value, physical_damage.max.value],
      },
      cold_damage: [cold_damage.min.value, cold_damage.max.value],
      aps: properties.attack_speed(),
    };
  } else {
    return base_properties;
  }
};

const snapshotRequirements = (item: Item) => {
  const { level, dex, int, str } = item.requirements.list();

  return {
    level,
    dexterity: dex,
    intelligence: int,
    strength: str,
  };
};

const statsTranslated = (container: Container<any>, format: Format) => {
  return format.stats(
    Object.entries(container.stats()).map(([id, stat]) => {
      return {
        id,
        value: stat.values.valueOf(),
      };
    }),
  );
};

/**
 *
 * @param item {Item}
 */
const snapShotItem = (item: Item, format: Format): PropsType<typeof Popup>['item'] => {
  const rarity = item.rarity.toString();

  const properties = snapshotProperties(item);

  return {
    base: {
      name: i18n.base_item_types[item.baseitem.id].name,
    },
    name: item.name.lines()[1],
    elder: item.isElderItem(),
    shaper: item.isSHaperItem(),
    implicitStats: statsTranslated(item.implicits, format),
    explicitStats: statsTranslated(item.affixes, format),
    rarity: rarity === 'showcase' ? 'unique' : rarity,
    ...properties,
    requirements: snapshotRequirements(item),
    corrupted: item.props.corrupted,
  };
};

const format = new Format();
format.configure({ datas: i18n.datas });

storiesOf('poe-mods integration', module)
  .add('Helmet', () => <Popup item={snapShotItem(helmet, format)} />)
  .add('Weapon', () => <Popup item={snapShotItem(dagger, format)} />);
