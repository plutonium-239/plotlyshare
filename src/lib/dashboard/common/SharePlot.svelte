<script lang="ts">
    import SharedIcon from '$icons/shared.svg?raw'
    import EyeHiddenIcon from '$icons/eye-hidden.svg?raw'

    export let sharingPlot: (plotid: string) => void
    export let key: string
    export let visible: boolean

</script>

<button title={visible ? "Plot is public": "Plot is private"} type="button" on:click={() => sharingPlot(key)}
class="z-[5] btn btn-circle btn-secondary p-1 w-8 h-8 min-h-0" class:sharingHideCls={!visible}>
    {#if visible}
        {@html SharedIcon}
    {:else}
        {@html EyeHiddenIcon}
    {/if}
</button>


<style type="postcss">
    .sharingHideCls {
        @apply btn-ghost text-secondary;
    }
</style>