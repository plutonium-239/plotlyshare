import type { PlotlyDataLayoutConfig } from 'plotly.js-dist-min';
import { persisted } from 'svelte-persisted-store';
import { writable, type Writable } from 'svelte/store';

export const loggedIn = persisted('loggedIn', false)

type DashboardView = 'list' | 'grid'
export const dashboardView = persisted('dashboardView', 'list' as DashboardView)

export const forceDarkPlots = persisted('forceDarkPlots', false)

export type PlotData = PlotlyDataLayoutConfig

export type PlotMetadata = { 
    public: boolean,
    name: string, 
    time_created: string, 
    timestamp: number, 
    linked_file: URL
}

export type ProfileData = {
    email: string
    family_name: string
    given_name: string
    id: string
    name: string
    picture: string
    provider: string
    uuid: string
    verified_email: boolean
}

let sortedMeta: [string, PlotMetadata][]

export async function getDemoMetadata(): Promise<Map<string, PlotMetadata>> {
    if (!sortedMeta) {
        const meta: any = await fetch('/public-filtered.json').then((res) => res.json());
        const _data: Map<string, PlotMetadata> = new Map(Object.entries(meta.plots))
        sortedMeta = [..._data.entries()].sort(
            (a: [string, PlotMetadata], b: [string, PlotMetadata]) => b[1].timestamp - a[1].timestamp
        )
    }
    return new Map(sortedMeta);
}

export let data = persisted('cachedData', new Map() as Map<string, PlotMetadata>)
export let dates : Map<string, {long_time: string, short_time: string}> = new Map()