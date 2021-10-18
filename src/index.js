import chromium from 'chrome-aws-lambda';
import axios from 'axios';

const collect = async (browser, url) => {
	const page = await browser.newPage(); 

		await page.setViewport({ width: 1920, height: 1080 });

		await page.goto(url);

		const payload = await page.evaluate(async () => {

			const a = document.querySelectorAll('a').innerText;

			console.log(a);

			/*const hrefs = a.map(url => { 
				const href = url.getAttribute('href')
				return href != null && href != undefined 
					? href 
					: null;
			});
*/
			const numbers = document.querySelector('body').innerText;


			const data = { a, ...numbers }
			return data;
		});
};

exports.handler = async (event, context) => {
	const browser = await chromium.puppeteer.launch({
		args: [
			...chromium.args,
			'--nosandbox'
		],
		defaultViewport: chromium.defaultViewport,
		executablePath: await chromium.executablePath,
		headless: chromium.headless
	});

	try {

		const { url } = event;
		console.log(`[Recount crawling service] URL: ${url}`);

		const data = await collect(browser, url);


		await browser.close();

		console.log(`[Recount crawling service] Details: `, data);

		return context.succeed({ url, data });
	
	} catch (e) { 
		console.error(e.toString());
		return context.fail({ error: e.toString() });
	} finally {
		if(browser !== null) {
			await browser.close();
			return event;
		}
	}
};