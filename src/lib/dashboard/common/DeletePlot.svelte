<script lang="ts">
    import DeleteIcon from '$icons/delete.svg?raw'
    import { toast } from 'svoast';

    export let deletePlot: (key: string) => void
    export let key: string

    if (key.startsWith("demo.")) 
        deletePlot = () => { toast.warning("Since these are demo plots, delete and edit will not work.") }
</script>

<button type="submit" on:click={() => deletePlot(key)}
    class="z-[5] btn btn-outline btn-error btn-square btn-sm custom-btn">
    {@html DeleteIcon}
</button>