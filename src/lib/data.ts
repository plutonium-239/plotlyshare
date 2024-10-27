import type { PlotlyDataLayoutConfig } from 'plotly.js-dist-min';
import { persisted } from 'svelte-persisted-store';
import { writable, type Writable } from 'svelte/store';
import type { CollectionData, PlotData, UserData } from '../../functions/api/utils';

/**
 * Whether the user is logged in.
 */
export const loggedIn = persisted('loggedIn', false)

/**
 * The type of view to use for the dashboard.
 */
type DashboardView = 'table' | 'grid' | 'folder' | 'tree'
/**
 * The current view of the dashboard.
 */
export const dashboardView = persisted('dashboardView', 'list' as DashboardView)

/**
 * Whether to force dark mode for plots.
 */
export const forceDarkPlots = persisted('forceDarkPlots', false)

/**
 * The full data for a plot, including layout and data.
 */
export type PlotFullData = PlotlyDataLayoutConfig

/**
 * The metadata for a plot.
 */
export type PlotMetadata = PlotData

/**
 * A cached plot, including its name, timestamp, and data.
 */
export type CachedPlot = {
    name: string,
    timestamp: number,
    plot_data: PlotFullData
}

/**
 * The profile data for a user.
 */
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
let _rootcollections: string[]

type MappedUserData = {
    plots: Map<string, PlotData>, 
    collections: Map<string, CollectionData>,
    rootCollections: string[]
}

/**
 * Gets the metadata for the demo plots.
 * @returns A promise that resolves to an object containing the plots and collections.
 */
export async function getDemoMetadata(): Promise<MappedUserData> {
    if (!sortedMeta) {
        const meta = await fetch('/public-filtered.json').then((res) => res.json()) as UserData;
        // const _data: Map<string, PlotMetadata> = new Map(Object.entries(meta.plots))
        _collections = new Map(Object.entries(meta.collections))
        _rootcollections = meta.rootCollections
        sortedMeta = Object.entries(meta.plots).sort(
            (a: [string, PlotMetadata], b: [string, PlotMetadata]) => b[1].timestamp - a[1].timestamp
        )
        console.log("getting demo data");
        console.log(sortedMeta);
        console.log(_collections);
        console.log(_rootcollections);
    }
    return {plots: new Map(sortedMeta), collections: _collections, rootCollections: _rootcollections};
}

const mapSerializer = {
    parse: (data: string) => {
        return new Map(JSON.parse(data));
    },
    stringify: (data: Map<string, any>) => {
        return JSON.stringify([...data]);
    }
}

/**
 * **All** the saved plot metadata.
 */
export let savedData = persisted('metadata', new Map() as Map<string, PlotMetadata>, {serializer: mapSerializer})
/**
 * The **current** collection's plot metadata.
 */
export let data = writable(new Map() as Map<string, PlotMetadata>)
/**
 * **All** the saved collections.
 */
export let savedCollections = persisted('collections', new Map() as Map<string, CollectionData>, {serializer: mapSerializer})

/**
 * Root collections of the user.
 */
export let rootCollections = persisted('rootCollections', [] as string[])
/**
 * The **current** collection data.
 */
export let collections = writable(new Map() as Map<string, CollectionData>)
/**
 * The current collection.
 */
export let collection = persisted('lastViewedCollection', {} as (CollectionData & {id: string}) | null)
/**
 * A map of plot IDs to their long and short time strings.
 */
export let dates : Map<string, {long_time: string, short_time: string}> = new Map()

/**
 * The cached plots (*actual plot data, not metadata*).
 */
export let cachedPlots = persisted('cachedPlots', new Map() as Map<string, CachedPlot>, {serializer: mapSerializer})

/**
 * The response from the profile API.
 */
export type ProfileAPIResponse = {
    name: string, 
    picture: string, 
    cli_token: string, 
    uid: string
}

/**
 * The cached profile data.
 */
export let profile = persisted('cachedProfile', {uid: 'demo_plots'} as ProfileAPIResponse)

// export let demoData = persisted('demoData', await getDemoMetadata())
/**
 * The title of the current plot.
 */
export let plotTitle = writable("Fetching plot name...")

const short_format = Intl.DateTimeFormat('default', {day: 'numeric', month:'short', hour:'numeric', minute:'numeric', hour12:false});
/**
 * Updates the dates map with the long and short time strings for each plot.
 * @param data The plot metadata.
 */
export function updateDates(data: Map<string, PlotMetadata>) {
    data.forEach((value, key) => {
        const d = new Date(value.time_created);
        dates.set(key, {long_time: d.toLocaleString(), short_time: short_format.format(d)});
    });
    console.log("dates calcd")
    // console.log(dates);
}

/**
 * A list of plot IDs that are not in any collection.
 */
export let plotsNotInCollections: Writable<string[]> = writable([])

/**
 * Updates the list of plots that are not in any collection.
 * @param data The plot metadata.
 * @param collections The collection data.
 */
export function updatePlotsNotInCollections(data: Map<string, PlotMetadata>, collections: Map<string, CollectionData>) {
    console.log("plots not in collection updated");
    plotsNotInCollections.set([])
    data.forEach((plot, plotid) => {
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
            plotsNotInCollections.update((currentVal) => [...currentVal, plotid])
        }
    })
    // console.log(plotsNotInCollections);
    
}

type fonts = 'Cascadia Mono' | 'Overpass Mono' | 'Orbit' | 'Chakra Petch' | 'Readex Pro' 
export let selectedFont: Writable<fonts> = persisted('selectedFont', 'Cascadia Mono');

selectedFont.subscribe((font) => {
    document.documentElement.style.setProperty('--selected-font', font);
})