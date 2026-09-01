import { es, type Dictionary } from "./es";
import { en } from "./en";
import type { Locale } from "../config";

export const dictionaries: Record<Locale, Dictionary> = { es, en };

export type { Dictionary };
