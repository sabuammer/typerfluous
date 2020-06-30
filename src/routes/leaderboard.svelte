<script context="module">
  export async function preload(page, session) {
    let leaderboardData = await fire
      .database()
      .ref("leaderboard")
      .once("value", snapshot => snapshot);
    leaderboardData = leaderboardData.val();

    return { leaderboardData };
  }
</script>

<script>
  import { fade } from "svelte/transition";
  import fire from "../config/fire";

  export let leaderboardData;
</script>

<style>
  table {
    width: 69vw;
    margin-top: 25px;
    border-collapse: collapse;
    font-size: 1.2em;
  }

  th,
  td {
    text-align: left;
    padding: 10px;
  }

  tr:nth-child(even) {
    background: #9aa2ad;
  }

  tr:nth-child(odd) {
    background: #c8d2e0;
  }

  #header-row {
    background: #333;
    color: white;
  }

  img {
    height: 1.5em;
    width: 1.5em;
    border-radius: 50%;
    margin-right: 10px;
  }

  a {
    text-decoration: none;
    display: flex;
    align-items: center;
  }
</style>

<table in:fade>
  <thead>
    <tr id="header-row">
      <th>#</th>
      <th>Username</th>
      <th>WPM</th>
      <th>Accuracy</th>
    </tr>
  </thead>
  <tbody>
    {#if leaderboardData}
      {#each { length: leaderboardData.length > 10 ? 10 : leaderboardData.length } as _, i}
        <tr>
          <td>{i + 1}</td>
          <td>
            <a href={`profile/${leaderboardData[i].username}`}>
              <img
                src={leaderboardData[i].photoURL}
                alt="The user's profile picture" />
              {leaderboardData[i].username}
            </a>
          </td>
          <td>{Math.round(leaderboardData[i].wpm)}</td>
          <td>{Math.round(leaderboardData[i].accuracy)}</td>
        </tr>
      {/each}
    {/if}
  </tbody>
</table>
