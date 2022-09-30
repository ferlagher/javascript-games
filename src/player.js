export default class Player {
    constructor(data = {}) {
        Object.assign(this, data);
    };

    saveData() {
        localStorage.setItem('player', JSON.stringify(this));
    }

    editData = () => {
        const modal = document.createElement('dialog');
        const title = this.name ? 'Editar perfil' : 'Bienvenid@';
        const text = this.name ? '' : 'Para continuar, elije un nombre de usuario y un avatar.';
        let radios = '';
    
        for (let i = 0; i < 6; i++) {
            const checked = this?.avatar === `avatar${i+1}` ? 'checked' : ''; 
            radios += `
                <label for="avatar${i+1}" class="radio">
                    <input id="avatar${i+1}" value="avatar${i+1}" type="radio" name="playerAvatar" ${checked} required>
                    <svg>
                        <use xlink:href="../images/avatars.svg#avatar${i+1}"></use>
                    </svg>
                </label>
            `;
        }
    
        const temp = `
                <h2>${title}</h2>
                <p>${text}</p>
                <form id="playerForm">
                    <input type="text" name="playerName" placeholder="Nombre" value="${this?.name || ''}" required>
                    <div class="config__radio">
                    ${radios}
                    </div>
                    <div class="config__buttons">
                        ${this?.scores ? '<button id="clearScore" class="button">Borrar puntuaciones</button>' : ''}
                        <div class="config__buttons--form">
                            ${this.name ? '<button type="reset" class="button">Cancelar</button>' : ''}
                            <button type="submit" class="button">Guardar</button>
                        </div>
                    </div>
                </form>
        `;
    
        modal.classList.add('config')
        modal.innerHTML = temp;
        document.querySelector('main').append(modal);
        modal.showModal();
        modal.style.scale = 1;
        modal.style.opacity = 1;
    
        const form = document.querySelector('#playerForm');
        const clearScore = document.querySelector('#clearScore');

        form.addEventListener('submit', e => {
            e.preventDefault();

            this.name = document.querySelector('[name="playerName"]').value;
            this.avatar = document.querySelector('[name="playerAvatar"]:checked').value;
            this.saveData();

            modal.removeAttribute('style');
            setTimeout(() => {
                modal.remove();
            }, 200);
            this.updateAvatar();
        });

        form.addEventListener('reset', e => {
            e.preventDefault();

            modal.removeAttribute('style');
            setTimeout(() => {
                modal.remove();
            }, 300);
        })

        clearScore?.addEventListener('click', e => {
            e.preventDefault();

            this.scores = {};
            this.saveData();
            location.reload();
        })
    };

    saveScore(game, score) {
        this.scores ||= {};
        this.scores[game] = score;
        this.saveData();
    }

    updateAvatar() {
        const playerAvatar = document.querySelectorAll('.avatar--player');
        playerAvatar?.forEach(svg => svg.innerHTML = `<use xlink:href="../images/avatars.svg#${this.avatar}"></use>`);
    };
};