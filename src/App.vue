<template>
  <div >
     <app-navbar></app-navbar>
     <router-view></router-view>
     <app-footer></app-footer>
  </div>
</template>

<script>
import Navbar from './components/NavBar'
import Footer from './components/Footer'

export default {

  components : {
    appNavbar : Navbar,
    appFooter : Footer,
  },
  
  created(){
    this.$store.dispatch("initAuth");
  }
}
</script>

<style>

</style>