const axios = require('axios');
const express = require('express');
const puppeteer = require('puppeteer');
const PORT = 8000;

const app = express()

getBoulogneMovies();
getTouquetMovies();

app.listen(PORT, ()=> console.log(`Here is the movies :`))

async function getBoulogneMovies() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://boulogne.megarama.fr/FR/43/horaires-cinema-multiplexe-boulogne-boulogne-sur-mer.html', { waitUntil: 'networkidle2' });

    const planning = await page.evaluate(() => {
        const movies = [];
        
        const date = document.querySelector('.container-fluid.marketing .hh.horaireSelect')?.getAttribute('reljour');
        
        document.querySelectorAll('div.row.color1.horaireZoning.zoneEspace').forEach(movie => {
            const title = movie.querySelector('.afficheTitre')?.innerText.trim();
            const horaires = [];
            movie.querySelectorAll('.horaireSeances > div.row > div.BTH > div.BTHoraire').forEach(seance => {
                const heure = seance.querySelector('a.Erakys_select_seance > div.heure')?.innerText.trim();
                horaires.push({
                    seance: heure,
                });
            });
            if (title) {
                movies.push({
                    film: title,
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
            const horaires = [];
            movie.querySelectorAll('.css-12wv5o6 time.css-1lgx68j').forEach(time => {
                horaires.push({
                    seance: time.innerText.trim(),
                });
            });
            if (title) {
                films.push({
                    film: title,
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
