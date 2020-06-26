<script>
    import fire from "../../config/fire";
    import {onMount} from "svelte";
</script>

<img src={fire.auth().currentUser.photoURL} alt="The user's profile picture">