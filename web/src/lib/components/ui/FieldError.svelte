<script lang="ts">
	let { id, message }: { id: string; message?: string | null } = $props();
</script>

{#if message}
	<p {id} class="text-micro text-error mt-1.5">{message}</p>
{/if}
