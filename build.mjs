import { createStorage } from "unstorage";
import driver from "unstorage/drivers/fs-lite";

import { execa } from 'execa';

const storage = createStorage({
	driver: driver({ base: "./pkgs" }),
});

const packages = await storage.getKeys();
const pkgbuild = packages.filter(pkg => pkg.endsWith('PKGBUILD'))

for await (const pkg of pkgbuild) {
	try {
		await execa('sudo', ['rm', '-rf', '/var/lib/aurbuild'], { stdio: 'inherit'})

		const pth = pkg.replaceAll(':', '/')
		const dir = pkg.split(':').slice(0, -1).join('/')

		const file = await storage.getItem(pkg)

		const pkgName = file.match(/^pkgname=(.+)$/m)[1]
		const prevVersion = file.match(/^pkgver=(.+)$/m)[1]
		const prevRelease = file.match(/^pkgrel=(.+)$/m)[1]

		const updt = file.replace(/pkgrel=\d+/g, `pkgrel=${parseInt(prevRelease) + 1}`);

		await storage.setItem(pkg, updt)

		let localRepo = 'chroot';

		if (dir.startsWith('gnome')) localRepo = 'gnome'

		await execa('paru', ['-B', dir, '--noconfirm', '--localrepo', localRepo], { stdio: 'inherit'})

		const updatedFile = await storage.getItem(pkg)
		const nextVersion = updatedFile.match(/^pkgver=(.+)$/m)[1]
		const nextRelease = updatedFile.match(/^pkgrel=(.+)$/m)[1]

		const prevBuild = `${prevVersion}-${prevRelease}`;
		const nextBuild = `${nextVersion}-${nextRelease}`;

		const commit = `chore(pkg): update \`${pkgName}\` from \`${prevBuild}\` to \`${nextBuild}\``

		await execa('git', ['commit', '-m', commit, '--', pth], { stdio: 'inherit'})
	} catch (err) {
		console.error(err)
	}
}

await execa('git', ['push'], { stdio: 'inherit'})