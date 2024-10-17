<script lang="ts">
    import DeleteIcon from '$icons/delete.svg?raw'

    export let deletePlot: (key: string) => void
    export let key: string

    if (key.startsWith("demo.")) deletePlot = () => {}
</script>

<button type="submit" on:click={() => deletePlot(key)}
    class="z-[5] btn btn-outline btn-error btn-square btn-sm custom-btn">
    {@html DeleteIcon}
</button>