<script>
  export let status;
  export let error;

  const dev = process.env.NODE_ENV === "development";
</script>

<style>
  h1,
  p {
    margin: 0 auto;
  }

  h1 {
    font-size: 5em;
    font-weight: bold;
    margin: 20px auto;
  }

  p {
    margin: 20px auto;
    font-size: 2em;
  }

  .error {
    display: flex;
    flex-direction: column;
    margin: 0 auto;
  }

  @media (min-width: 480px) {
    h1 {
      font-size: 4em;
    }
  }
</style>

<svelte:head>
  <title>{status}</title>
</svelte:head>

<div class="error">
  <h1>{status}</h1>
  <p>{error.message}</p>
</div>

{#if dev && error.stack}
  <pre>{error.stack}</pre>
{/if}
