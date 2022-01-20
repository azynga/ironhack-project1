class View {
    constructor() {
        this.canvas = document.querySelector('#canvas');
        this.ctx = canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvasCenter = {
            x: canvas.width / 2,
            y: canvas.height / 2
        };
        this.fps = 0; // 0: No framerate lock
        this.drawAnchor = {
            x: 0,
            y: 0
        };
        this.viewOffset = {
            x: this.drawAnchor.x - this.canvasCenter.x,
            y: this.drawAnchor.y - this.canvasCenter.y
        };
        this.showControls = false;
        this.colors = {
            primary: function(opacity = 1) {return `rgba(200, 160, 230, ${opacity})`},
            player: 'rgba(200, 160, 230, 1)',
            star: 'rgba(250, 130, 130, 1)',
            background: 'rgba(0, 0, 34, 1)'
        };
        this.gridSize = 50;
    }

    clear() {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        // this.canvas.width = this.canvas.width;
    }

    updateViewPosition(drawAnchor) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.canvasCenter = {
        x: canvas.width / 2,
        y: canvas.height / 2
        };
        this.drawAnchor = drawAnchor;
        this.viewOffset = {
            x: this.drawAnchor.x - this.canvasCenter.x,
            y: this.drawAnchor.y - this.canvasCenter.y
        };
    }

    drawBackground() {
        const ctx = this.ctx;
        const gridSize = this.gridSize;
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = this.colors.primary(1);
        for(let x = 0; x <= canvas.width + gridSize; x += gridSize) {
            for(let y = 0; y <= canvas.height + gridSize; y += gridSize) {
                ctx.fillRect(
                    x - this.viewOffset.x % gridSize,
                    y - this.viewOffset.y % gridSize,
                    1.5,
                    1.5
                );
            };
        };
    }

    getDrawPosition(absolutePosition) {
        return {
            x: absolutePosition.x - this.viewOffset.x,
            y: absolutePosition.y - this.viewOffset.y
        }
    }
    
    drawTrail(trailParticles) {
        trailParticles.forEach((position, index) => {
            const ctx = this.ctx;
            const drawPosition = this.getDrawPosition(position);
            const opacity = 0.4 - (index / (player.trailParticles.length * 2));
            const thickness = 2;
            ctx.fillStyle = this.colors.primary(opacity);
            ctx.fillRect(drawPosition.x - thickness / 2, drawPosition.y - thickness / 2, thickness, thickness);
        });
    }

    drawOrb(orb) {
        const ctx = this.ctx;
        const drawPosition = this.getDrawPosition(orb.position);
        ctx.moveTo(drawPosition.x, drawPosition.y);
        ctx.arc(drawPosition.x, drawPosition.y, orb.radius, 0, 2 * Math.PI); 
    }

    drawBatch(orbsArray) {
        const ctx = this.ctx;
        const orbsOnScreen = orbsArray.filter(orb => !orb.isOffScreen);
        if(orbsOnScreen[0].type === 'player') {
            const player = orbsArray[0];
            ctx.beginPath();
            ctx.fillStyle = this.colors.player;
            this.drawOrb(player);
            ctx.fill();
            ctx.closePath();
        }

        this.drawTrail(universe.player.trailParticles);

        ctx.beginPath();
        ctx.fillStyle = this.colors.star;
        for(let i = 0; i < orbsOnScreen.length; i ++) {
            orbsOnScreen[i].type !== 'player' && this.drawOrb(orbsArray[i])
        }
        ctx.fill();
        ctx.closePath();
    }

    drawControls() {
        const ctx = this.ctx;
        if(this.showControls) {
            ctx.fillStyle = this.colors.primary(1);
            
            ctx.font = 'bold 12px sans-serif';
            ctx.textBaseline = 'top';
            ctx.fillText('[ARROW KEYS]: BOOST', 30, 30);
            ctx.fillText('[SPACE]: ZERO GRAVITY', 30, 50);
            ctx.fillText('[SHIFT]: REVERSE GRAVITY', 30, 70);

            ctx.font = 'bold 84px sans-serif';
            ctx.textBaseline = 'middle';
            ctx.fillText('GAME PAUSED', 30, this.canvasCenter.y, this.canvas.width - 60);
        };
    }

    drawFuelDisplay() {
        const ctx = this.ctx;
        const displaySize = {
            width: this.canvas.width,
            height: 5
        };
        ctx.beginPath();
        ctx.strokeStyle = this.colors.primary(0.7);
        ctx.strokeRect(
            this.canvasCenter.x - displaySize.width / 2,
            this.canvas.height - displaySize.height,
            displaySize.width,
            displaySize.height
        );
        ctx.fillStyle = this.colors.primary(0.8);
        ctx.fillRect(
            this.canvasCenter.x - displaySize.width / 2,
            this.canvas.height - displaySize.height,
            (displaySize.width / player.maxFuel) * player.fuel,
            displaySize.height
        )
        ctx.stroke();
        ctx.closePath();
    }

    drawAll(orbsArray) {
        const ctx = this.ctx;
        if(gamePaused) {
            ctx.filter = 'blur(5px)';
            this.drawBatch(orbsArray);
            ctx.filter = 'none';
        } else {
            this.drawBackground();
            this.drawBatch(orbsArray);
            this.drawFuelDisplay();
        }
        this.drawControls();
    }

    isOffScreen(orb) {
        const drawAnchor = this.drawAnchor;
        const canvasCenter = this.canvasCenter;
        const offScreenX = orb.position.x < drawAnchor.x - canvasCenter.x - orb.radius || orb.position.x > drawAnchor.x + canvasCenter.x + orb.radius;
        const offScreenY = orb.position.y < drawAnchor.y - canvasCenter.y - orb.radius || orb.position.y > drawAnchor.y + canvasCenter.y + orb.radius;
        return offScreenX || offScreenY;
    }
}