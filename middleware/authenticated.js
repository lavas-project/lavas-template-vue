export default function ({ store, redirect }) {
    console.log('bbb');
    if (!store.getters.isAuthenticated) {
        console.log('bbb1');
        // return redirect('/auth/sign-in')
    }
}
