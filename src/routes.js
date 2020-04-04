import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from './components/Home'
import UserLogin from './components/user/UserLogin'
import UserProfile from './components/user/UserProfile'
import store from './store'

Vue.use(VueRouter);


export const router = new VueRouter({
  routes : [
    {
        path : '/', 
        component: Home, 
        beforeEnter(to, from, next){
            if(store.getters.isAuthenticated){
                next();
            }else{
                next("/login");
            }
        }
    },

    {path : '/login', component: UserLogin},
    {path : '/myprofile', component: UserProfile},
  ],
  mode:'history'
});
