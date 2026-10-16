/**
 * Lavalink v4 filter payloads — applied when a live player session exists.
 * Discord voice is still capped (~128–384 kbps depending on boost); filters
 * change colour/space of the mix, not magical "studio quality".
 */

export type FilterPreset =
  | "off"
  | "bass"
  | "soft"
  | "nightcore"
  | "vaporwave"
  | "8d"
  | "karaoke"
  | "tremolo";

export interface FilterDef {
  id: FilterPreset;
  label: string;
  blurb: string;
  /** Lavalink filters object (partial) */
  payload: Record<string, unknown>;
}

export const FILTERS: Record<FilterPreset, FilterDef> = {
  off: {
    id: "off",
    label: "Kapalı",
    blurb: "Tüm filtreler sıfır",
    payload: {},
  },
  bass: {
    id: "bass",
    label: "Bass Boost",
    blurb: "Alçak frekans güçlendirilir",
    payload: {
      equalizer: [
        { band: 0, gain: 0.6 },
        { band: 1, gain: 0.45 },
        { band: 2, gain: 0.25 },
        { band: 3, gain: 0.1 },
      ],
    },
  },
  soft: {
    id: "soft",
    label: "Soft",
    blurb: "Yumuşak, yorucu değil",
    payload: {
      lowPass: { smoothing: 20 },
      equalizer: [
        { band: 0, gain: -0.1 },
        { band: 1, gain: -0.05 },
      ],
    },
  },
  nightcore: {
    id: "nightcore",
    label: "Nightcore",
    blurb: "Hız + pitch yukarı",
    payload: {
      timescale: { speed: 1.15, pitch: 1.15, rate: 1 },
    },
  },
  vaporwave: {
    id: "vaporwave",
    label: "Vaporwave",
    blurb: "Yavaş, kalın (reverb-benzeri his)",
    payload: {
      timescale: { speed: 0.85, pitch: 0.85, rate: 1 },
      equalizer: [
        { band: 0, gain: 0.3 },
        { band: 1, gain: 0.2 },
      ],
    },
  },
  "8d": {
    id: "8d",
    label: "8D",
    blurb: "Rotation — mekânsal dolanma",
    payload: {
      rotation: { rotationHz: 0.2 },
    },
  },
  karaoke: {
    id: "karaoke",
    label: "Karaoke",
    blurb: "Vokal baskılama denemesi",
    payload: {
      karaoke: {
        level: 1,
        monoLevel: 1,
        filterBand: 220,
        filterWidth: 100,
      },
    },
  },
  tremolo: {
    id: "tremolo",
    label: "Tremolo",
    blurb: "Titreşimli genlik (hafif reverb hissi)",
    payload: {
      tremolo: { frequency: 3.5, depth: 0.45 },
    },
  },
};

/** True reverb needs a Lavalink plugin; these are built-in approximations. */
export function listFilterChoices(): { name: string; value: FilterPreset }[] {
  return (Object.keys(FILTERS) as FilterPreset[]).map((id) => ({
    name: FILTERS[id].label,
    value: id,
  }));
}
