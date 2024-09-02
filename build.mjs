import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";

import { execa } from 'execa';

const storage = createStorage({
	driver: fsDriver({ base: "./" }),
});

const packages = await storage.getKeys();

for await (const pkg of packages) {
	if (!pkg.endsWith('PKGBUILD')) continue

	try {
		const path = pkg.replace(':', '/')
		const dir = path.split('/')[0]

		const file = await storage.getItem(pkg)

		const pkgName = file.match(/^pkgname=(.+)$/m)[1]
		const prevVersion = file.match(/^pkgver=(.+)$/m)[1]
		const prevRelease = file.match(/^pkgrel=(.+)$/m)[1]

		const updt = file.replace(/pkgrel=\d+/g, `pkgrel=${parseInt(prevRelease) + 1}`);

		await storage.setItem(pkg, updt)

		await execa('paru', ['-B', dir, '--noconfirm'], { stdio: 'inherit'})

		const updatedFile = await storage.getItem(pkg)
		const nextVersion = updatedFile.match(/^pkgver=(.+)$/m)[1]
		const nextRelease = updatedFile.match(/^pkgrel=(.+)$/m)[1]

		const prevBuild = `${prevVersion}-${prevRelease}`;
		const nextBuild = `${nextVersion}-${nextRelease}`;

		const commit = `chore(pkg): update \`${pkgName}\` from \`${prevBuild}\` to \`${nextBuild}\``

		await execa('git', ['commit', '-m', commit, '--', path], { stdio: 'inherit'})
	} catch (err) {
		console.error(err)
	}
}

await execa('git', ['push'], { stdio: 'inherit'})