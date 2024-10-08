import type { PlotlyDataLayoutConfig } from 'plotly.js-dist-min';
import { persisted } from 'svelte-persisted-store';
import { writable, type Writable } from 'svelte/store';
import type { CollectionData, PlotData, UserData } from '../../functions/api/utils';

export const loggedIn = persisted('loggedIn', false)

type DashboardView = 'table' | 'grid' | 'folder'
export const dashboardView = persisted('dashboardView', 'list' as DashboardView)

export const forceDarkPlots = persisted('forceDarkPlots', false)

export type PlotFullData = PlotlyDataLayoutConfig

export type PlotMetadata = PlotData

export type CachedPlot = {
    name: string,
    timestamp: number,
    plot_data: PlotFullData
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
let _collections: Map<string, CollectionData>

export async function getDemoMetadata(): Promise<{plots: Map<string, PlotData>, collections: Map<string, CollectionData>}> {
    if (!sortedMeta) {
        const meta = await fetch('/public-filtered.json').then((res) => res.json()) as UserData;
        // const _data: Map<string, PlotMetadata> = new Map(Object.entries(meta.plots))
        _collections = new Map(Object.entries(meta.collections))
        sortedMeta = Object.entries(meta.plots).sort(
            (a: [string, PlotMetadata], b: [string, PlotMetadata]) => b[1].timestamp - a[1].timestamp
        )
        console.log("getting demo data");
        console.log(sortedMeta);
        console.log(_collections);        
    }
    return {plots: new Map(sortedMeta), collections: _collections};
}

const mapSerializer = {
    parse: (data: string) => {
        return new Map(JSON.parse(data));
    },
    stringify: (data: Map<string, any>) => {
        return JSON.stringify([...data]);
    }
}


export let data = persisted('metadata', new Map() as Map<string, PlotMetadata>, {serializer: mapSerializer})
export let collections = persisted('collections', new Map() as Map<string, CollectionData>, {serializer: mapSerializer})
export let dates : Map<string, {long_time: string, short_time: string}> = new Map()
export let cachedPlots = persisted('cachedPlots', new Map() as Map<string, CachedPlot>, {serializer: mapSerializer})

export type ProfileAPIResponse = {name: string, picture: string, cli_token: string, uid: string}

export let profile = persisted('cachedProfile', {uid: 'demo_plots'} as ProfileAPIResponse)

// export let demoData = persisted('demoData', await getDemoMetadata())
export let plotTitle = writable("Fetching plot name...")

const short_format = Intl.DateTimeFormat('default', {day: 'numeric', month:'short', hour:'numeric', minute:'numeric', hour12:false});
export function updateDates(data: Map<string, PlotMetadata>) {
    data.forEach((value, key) => {
        const d = new Date(value.time_created);
        dates.set(key, {long_time: d.toLocaleString(), short_time: short_format.format(d)});
    });
    console.log("dates calcd")
    // console.log(dates);
}

export let plotsNotInCollections: string[] = []

export function updatePlotsNotInCollections(data: Map<string, PlotMetadata>, collections: Map<string, CollectionData>) {
    console.log("plots not in collection updated");
    plotsNotInCollections = []
    data.forEach((plot, plotid) => {
        // console.log(`searching for plot ${plotid}`);
        let found = false
        for (const [key, value] of collections) {
            if (value.members?.includes(plotid)) {
                // console.log(`plot ${plotid} found in collection ${key}`);
                found = true
                break
            }
        }
        if (!found) {
            // console.log(`plot ${plotid} not found`);
            plotsNotInCollections.push(plotid)
        }
    })
    // console.log(plotsNotInCollections);
    
}