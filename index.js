const puppeteer = require('puppeteer');

getBoulogneMovies();
getTouquetMovies();
getCoquellesMovies();

async function getBoulogneMovies() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://boulogne.megarama.fr/FR/43/horaires-cinema-multiplexe-boulogne-boulogne-sur-mer.html', { waitUntil: 'networkidle2' });


    const planning = await page.evaluate(() => {
        const movies = [];
        
        const date = document.querySelector('.container-fluid.marketing .hh.horaireSelect')?.getAttribute('reljour');
        
        document.querySelectorAll('div.row.color1.horaireZoning.zoneEspace').forEach(movie => {
            const title = movie.querySelector('.afficheTitre')?.innerText.trim();
            const affiche = movie.querySelector('.lazy.afficheGdImg')?.getAttribute('data-original');
            const horaires = [];
            movie.querySelectorAll('.horaireSeances > div.row > div.BTH > div.BTHoraire').forEach(seance => {
                const heure = seance.querySelector('a.Erakys_select_seance > div.heure')?.innerText.trim();
                horaires.push(heure);
            });
            if (title) {
                movies.push({
                    film: title,
                    affiche: affiche,
                    horaires: horaires
                });
            }
        });

        return {
            cinema: "Megarama Multiplex Boulogne-sur-mer",
            date: date,
            films: movies
        };
    });

    console.log(JSON.stringify(planning, null, 2));
    await browser.close();
}

async function getTouquetMovies() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.cinema3as.fr/actu/', { waitUntil: 'networkidle2' });

    const movies = await page.evaluate(() => {
        const films = [];
        document.querySelectorAll('.css-1kp4po0 > .css-oi3ngi').forEach(movie => {
            const title = movie.querySelector('.css-1dtz9kk > a.css-erexzk')?.innerText.trim();
            const affiche = movie.querySelector('img.css-bi7rho')?.getAttribute('src');
            const horaires = [];
            movie.querySelectorAll('.css-12wv5o6 time.css-1lgx68j').forEach(time => {
                horaires.push(time.innerText.trim());
            });
            if (title) {
                films.push({
                    film: title,
                    affiche: affiche,
                    horaires: horaires
                });
            }
        });
        return films;
    });

    const planning = {
        cinema: "Les 3AS Touquet-Paris-Plage",
        films: movies
    };

    console.log(JSON.stringify(planning, null, 2));
    await browser.close();
}

async function getCoquellesMovies() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://www.pathe.fr/cinemas/cinema-pathe-cite-europe', { waitUntil: 'networkidle2' });

    await autoScroll(page);

    const movies = await page.evaluate(() => {
        const films = [];

        document.querySelectorAll('#cinema-schedule .container .row').forEach(movie => {
            const title = movie.querySelector('.h3.ft-700.mt-1.mb-04 > a')?.innerText.trim();
            const affiche = movie.querySelector('.mr-3.card-screening__img > img')?.getAttribute('src');

            const horaires = new Set();
            movie.querySelectorAll('.ft-700.screening__title').forEach(time => {
                horaires.add(time.innerText.trim());
            });

            if (title && horaires.size > 0) {
                films.push({
                    film: title,
                    affiche: affiche,
                    horaires: Array.from(horaires)
                });
            }
        });

        return films;
    });

    const planning = {
        cinema: "Pathé Cité Europe",
        films: movies
    };

    console.log(JSON.stringify(planning, null, 2));
    await browser.close();
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            const distance = 200;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 300);
        });
    });
}
