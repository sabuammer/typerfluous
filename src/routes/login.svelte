<script>
    import {fade} from "svelte/transition";
    import LoginForm from "../components/LoginForm.svelte";
    import RegisterForm from "../components/RegisterForm.svelte";
</script>

<style>
    .auth-forms {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }
</style>

<div in:fade class="auth-forms">
    <LoginForm/>
    <RegisterForm/>
</div>
