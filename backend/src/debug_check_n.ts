
// Use IIFE
(async () => {
    try {
        console.log('Fetching alphabet map...');
        const mapRes = await fetch('http://localhost:3000/alphabet');
        const mapData = await mapRes.json();
        const map = mapData.alphabetMap;
        console.log(`N index: ${map['N']}`);

        const nIndex = map['N'];
        if (nIndex !== undefined) {
            console.log(`Fetching users at ${nIndex}...`);
            const usersRes = await fetch(`http://localhost:3000/users?skip=${nIndex}&limit=5`);
            const usersData = await usersRes.json();
            console.log('Users at N:', usersData.users);
        }
    } catch (e) {
        console.error(e);
    }
})();
