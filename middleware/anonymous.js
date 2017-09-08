export default function ({ store, redirect }) {
    console.log('aaa');
    if (store.getters.isAuthenticated) {
        console.log('aaa1');
        // return redirect('/')
    }
}
