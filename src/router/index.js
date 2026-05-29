import { createRouter, createWebHashHistory } from "vue-router";
import user from "@/components/user.vue";
import login from "@/components/login.vue";
import register from "@/components/register.vue";

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/user', component: user },
        { path: '/login', component: login },
        { path: '/register', component: register },
    ]
})

export default router;