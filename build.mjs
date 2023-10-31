import { execa } from 'execa';
import { stat, readdir, readFile, writeFile, access } from 'node:fs/promises';

const getPKGLine = async (keyword) => {
	let file = await readFile("PKGBUILD", "utf8");
	let lines = file.split(/\r?\n/);

	let value = 0;
	for (const line of lines) {
		if (!line.startsWith(keyword)) continue;

		value = line.split('=')[1];

		break;
	};

	return value || null;
}

const dirs = await readdir('.');

for (const entry of dirs) {
	const meta = await stat(entry);

	if (meta.isFile()) continue;

	const pkgbuild = await access(`${entry}/PKGBUILD`).then(() => true).catch(() => false);

	if (pkgbuild === false) continue;

	process.chdir(entry);

	try {
		const pkgName = await getPKGLine('pkgname');

		const prevVersion = await getPKGLine('pkgver');
		const prevRelease = await getPKGLine('pkgrel');

		const file = await readFile("PKGBUILD", "utf8");
		const updt = file.replace(/pkgrel=\d+/g, `pkgrel=${parseInt(prevRelease) + 1}`);

		await writeFile("PKGBUILD", updt);

		const { stdout } = await execa('paru', ['-U', '--localrepo', '--skipreview', '--noconfirm', '--sudoloop'], { all: true }).pipeAll(process.stdout);

		const nextVersion = await getPKGLine('pkgver');
		const nextRelease = await getPKGLine('pkgrel');

		const prevBuild = `${prevVersion}-${prevRelease}`;
		const nextBuild = `${nextVersion}-${nextRelease}`;

		const commit = `chore(pkg): update \`${pkgName}\` from \`${prevBuild}\` to \`${nextBuild}\``

		await execa('git', ['commit', '-m', commit, '--', 'PKGBUILD']);
	} catch (error) {
		console.log(error);
	}

	process.chdir('../')

	await execa('git', ['push']);
}
