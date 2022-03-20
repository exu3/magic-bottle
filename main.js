const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const MAP_SCALE = 50;

(window.onresize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
})();

function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

function magnitude(v) {
  return Math.sqrt(dot(v, v));
}

function normalize(v) {
  const l = magnitude(v);
  if (l > 0) {
    v.x /= l;
    v.y /= l;
  }
  return v;
}

function lerp(a, b, t) {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

function rayHitCircle({ ro, rd, circle, radius }) {
  let radius2 = radius * radius;

  let L = { x: circle.x - ro.x, y: circle.y - ro.y };
  let tca = dot(L, rd);
  let d2 = dot(L, L) - tca * tca;
  if (d2 > radius2) return false;
  let thc = Math.sqrt(radius2 - d2);
  return {
    t0: tca - thc,
    t1: tca + thc
  };
}

function reflect(d, n) {
  let dot2 = dot(d, n) * 2;
  return {
    x: d.x - n.x*dot2,
    y: d.y - n.y*dot2,
  }
}

const imageLinks = {
  fireball: "https://cloud-2u8ficsp5-hack-club-bot.vercel.app/0l1_sprite_4.png",
  laser: "https://cloud-2u8ficsp5-hack-club-bot.vercel.app/1l1_sprite_3.png",
  eyeball: "https://cloud-2u8ficsp5-hack-club-bot.vercel.app/2l1_sprite_2.png",
  flaskOutline:
    "https://cloud-pfm3bqx98-hack-club-bot.vercel.app/0layer_2_bottle_1.png",
  flaskFill:
    "https://cloud-pfm3bqx98-hack-club-bot.vercel.app/1layer_2__clone__bottle_1.png",
  door: "https://cloud-l1gxdgfvl-hack-club-bot.vercel.app/0new_piskel-5.png.png",
  key: "https://cloud-21hd3m26u-hack-club-bot.vercel.app/0new_piskel-6.png.png",
};

const loadImages = new Promise((res) => {
  const images = JSON.parse(JSON.stringify(imageLinks));
  for (const name in imageLinks) {
    images[name] = new Image();
    images[name].onload = () => {
      if (Object.values(images).every((i) => i.complete)) res(images);
    };
    console.log(imageLinks, name);
    images[name].src = imageLinks[name];
  }
  return images;
});

let ents = [];
class Ent {
  constructor(args = {}) {
    Object.assign(this, args);
    this.image = args.image ?? "fireball";
    this.x = args.x ?? 0;
    this.y = args.y ?? 0;
    this.w = args.w ?? 20;
    this.h = args.h ?? 20;
    this.vel = args.vel ?? { x: 0, y: 0 };
    this.friction = args.friction ?? 1;
    this.rot = args.rot ?? 0;
    this.hitBubbleSize =
      args.hitBubbleSize ?? magnitude({ x: this.w, y: this.h }) / 2;

    ents.push(this);
  }

  delete() {
    ents.splice(ents.indexOf(this), 1);
  }

  alive() {
    return ents.indexOf(this) > -1;
  }
}

let messages = [];
class Message {
  constructor(args = {}) {
    Object.assign(this, args);
    this.text = args.content ?? "";
    this.time = args.time ?? 2000;
    this.color = args.color ?? "white";
    this.x = args.x ?? 0;
    this.y = args.y ?? 0;

    messages.push(this);
  }
}

let player = new Ent({
  hitBubbleSize: 1,
  friction: 0.8,
  image: "flaskOutline",
  w: 40,
  h: 40,
});

let mousePos = { x: 0, y: 0 };
window.onclick = (e) => {
  mousePos = { x: e.pageX, y: e.pageY };
};

const keys = new Set();
window.onkeydown = (e) => keys.add(e.key);
window.onkeyup = (e) => keys.delete(e.key);

setInterval(() => {
  for (const enemy of ents)
    if (enemy.shoots) {
      let vel = normalize({
        x: player.x - enemy.x,
        y: player.y - enemy.y,
      });

      let projectile = new Ent({
        vel,
        hitBubbleSize: 5,
        spiky: true,
        image: "laser",
        update() {
          this.rot = Math.atan2(this.vel.y, this.vel.x);
        }
      });

      // calculate how far away we need to be to not hit the person spawning us
      const space = enemy.hitBubbleSize + projectile.hitBubbleSize;
      projectile.x = enemy.x + vel.x * space;
      projectile.y = enemy.y + vel.y * space;
      projectile.vel.x *= 5;
      projectile.vel.y *= 5;
    }
}, 1000);

function playerLogic() {
  let mv = { x: 0, y: 0 };
  if (keys.has("ArrowUp")) mv.y -= 5;
  if (keys.has("ArrowDown")) mv.y += 5;
  if (keys.has("ArrowLeft")) mv.x -= 5;
  if (keys.has("ArrowRight")) mv.x += 5;
  normalize(mv);
  player.vel.x += mv.x;
  player.vel.y += mv.y;
}

let state;
let cam = { x: 0, y: 0 };

function* delay(time) {
  let ready = false;
  setTimeout(() => (ready = true), time);
  while (!ready) yield;
}

function mapScale([x, y]) {
  return [x * MAP_SCALE, y * -MAP_SCALE];
}

function eyeDraw(images) {
  let { x, y, w, h } = this;
  y += Math.sin(this.seed + Date.now() / 100) * 1;
  ctx.drawImage(images.eyeball, x + w / -2, y + h / -2, w, h);
}

function aliveCount(ents) {
  return ents.filter((e) => e.alive()).length;
}

function* questGen(map) {
  yield* delay(300);
  // no thoughts head empty. text doesn't work -ella
  let text = new Message({
    text: "awefawefawef",
    color: "white",
    x: player.x,
    y: player.y,
  });

  // ADD THE ENEMIES
  let eyeballs = [];
  for (let i = 0; i < 10; i++) {
    const r = (i / 10) * Math.PI * 2;
    eyeballs.push(
      new Ent({
        seed: Math.random() * 100,
        shoots: true,
        x: Math.cos(r) * 190,
        y: Math.sin(r) * 190,
        draw: eyeDraw,
        w: 30,
        h: 30,
      })
    );
  }

  let doors = map.doors.map(
    ({ pos: [x, y] }) =>
      new Ent({
        x: x * MAP_SCALE,
        y: y * -MAP_SCALE,
        w: 50,
        h: 50,
        image: "door",
        ghost: true,
      })
  );

  let keyDoor = new Ent({
    x: map.oneoffs.keyDoor[0] * MAP_SCALE,
    y: map.oneoffs.keyDoor[1] * -MAP_SCALE,
    w: 50,
    h: 50,
    image: "door",
    ghost: true,
    unlock: false,
    update() {
      if (magnitude({ x: player.x - this.x, y: player.y - this.y }) < 30) {
        if (this.unlock) {
          alert("You got the key!");
        }
      }
    },
  });

  while (aliveCount(eyeballs) > 1) yield;

  eyeballs.concat(doors).forEach((e) => e.delete());

  yield* delay(300);

  const [x, y] = mapScale(map.oneoffs.megaMe);
  new Ent({ x, y, image: "eyeball", w: 70, h: 70, draw: eyeDraw, seed: 0 });

  let minimes = [];
  while (magnitude({ x: player.x - x, y: player.y - y }) > 215) yield;

  for (let i = 0; i < 10; i++) {
    const r = (i / 10) * Math.PI * 2;
    minimes.push(
      new Ent({
        seed: Math.random() * 100,
        shoots: true,
        x: Math.cos(r) * 100 + x,
        y: Math.sin(r) * 100 + y,
        draw: eyeDraw,
        w: 30,
        h: 30,
        update() {
          let oldX = this.x - x;
          let oldY = this.y - y;
          const angle = 0.01;
          const { cos, sin } = Math;
          this.x = x + oldX * cos(angle) - oldY * sin(angle);
          this.y = y + oldX * sin(angle) + oldY * cos(angle);
        },
      })
    );
  }

  while (aliveCount(minimes) > 1) yield;

  yield* delay(300);

  minimes.forEach((e) => e.delete());
  let key = new Ent({
    x,
    y,
    image: "key",
    w: 30,
    h: 30,
    update() {
      if (magnitude({ x: player.x - this.x, y: player.y - this.y }) < 50) {
        this.delete();
        keyDoor.unlock = true;
      }
    },
  });

  alert("you win");

  // if all the eyeballs are dead, the doors open to the other rooms
  // (and the mega-me spawns in the other room)
  // when the mega-me is dead, the key to the final door is dropped
}

function frame() {
  const { images, map, quest } = state;
  requestAnimationFrame(frame);

  if (player.alive()) {
    quest.next();
  }
  /* draw background color */
  ctx.fillStyle = "rgb(40, 45, 60)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  playerLogic();

  ctx.save();

  /* update camera */
  cam = lerp(cam, player, 0.1);
  ctx.translate(canvas.width / 2 - cam.x, canvas.height / 2 - cam.y);

  // render messages on the screen
  // it no work -ella
  ctx.save();
  for (const msg of messages) {
    ctx.fillStyle = msg.color;
    ctx.font = "20px Arial";
    ctx.fillText(msg.text, msg.x, msg.y);
  }
  ctx.restore();

  /* draw map */
  ctx.fillStyle = "slategray";
  const { circles, rectangles } = map;
  ctx.save();
  ctx.scale(MAP_SCALE, -MAP_SCALE);
  for (const {
    pos: [x, y],
    scale: [w, h],
  } of rectangles) {
    ctx.fillRect(x - w, y - h, w * 2, h * 2);
  }
  for (const {
    pos: [x, y],
    scale,
  } of circles) {
    ctx.beginPath();
    ctx.arc(x, y, scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  /* ENTITY GAME LOOP */
  for (const ent of ents) {
    ctx.fillStyle = "rgb(0,0,0)";
    const { x, y, w, h } = ent;

    if (ent.draw) ent.draw(images);
    else {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ent.rot);
      ctx.drawImage(images[ent.image], w / -2, h / -2, w, h);
      ctx.restore();
    }

    ent.vel.x *= ent.friction;
    ent.vel.y *= ent.friction;
    const speed = magnitude(ent.vel);
    let m = normalize({
      x: ent.vel.x,
      y: ent.vel.y,
    });
    (() => {
      const { pos: [x, y], scale } = circles[0]
      const { t1 } = rayHitCircle({
        ro: { x: ent.x, y: ent.y },
        rd: m,
        circle: { x, y },
        radius: scale * MAP_SCALE
      });

      if (t1 < 0) {
        const untilWall = speed + t1;
        const afterWall = speed - untilWall;
        ent.x += m.x * untilWall;
        ent.y += m.y * untilWall;
        const r = reflect(m, normalize({ x: ent.x - x, y: ent.y - y }));
        ent.x += r.x * afterWall;
        ent.y += r.y * afterWall;
        ent.vel = { x: r.x * speed, y: r.y * speed };
      } else {
        ent.x += m.x * speed;
        ent.y += m.y * speed;
      }
    })();

    if (ent.update) ent.update();

    if (ent.spiky)
      for (const other of ents) {
        if (ent !== other && !other.ghost) {
          let dx = ent.x - other.x;
          let dy = ent.y - other.y;
          let dist = magnitude({ x: dx, y: dy });
          dist -= ent.hitBubbleSize;
          dist -= other.hitBubbleSize;

          if (dist <= 0) {
            for (let i = 0; i < 3; i++) {
              let r = (i / 3) * Math.PI * 2;
              r += Math.random() * Math.PI * 2;
              new Ent({
                x: ent.x,
                y: ent.y,
                ghost: true,
                vel: { x: Math.cos(r), y: Math.sin(r) },
                friction: 0.9,
                update(ent) {
                  if (magnitude(this.vel) < 0.01) {
                    this.delete();
                  }
                  this.w = this.h = magnitude(this.vel) * 15;
                },
                diesOnZeroVel: true,
                image: "fireball",
                w: 5,
                h: 5,
              });
            }
            ent.delete(), other.delete();
          }
        }
      }
  }
  ctx.restore();
}
Promise.all([loadImages, fetch("./map.json").then((r) => r.json())]).then(
  ([images, map]) => {
    console.log(map);
    state = { images, map, quest: questGen(map) };
    frame();
  }
);

setInterval(() => {}, 100);
