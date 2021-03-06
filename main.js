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
    t1: tca + thc,
  };
}

function reflect(d, n) {
  let dot2 = dot(d, n) * 2;
  return {
    x: d.x - n.x * dot2,
    y: d.y - n.y * dot2,
  };
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
    this.text = args.text ?? "";
    this.time = args.time ?? 5000;
    this.color = args.color ?? "white";
    this.x = args.x ?? 0;
    this.y = args.y ?? 0;

    messages.push(this);
  }
}

// random message for no reason
let hello = new Message({
  text: "hello there.",
  color: "white",
  x: canvas.width / 4,
  y: canvas.height / 4,
  time: 9000,
});

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
        },
      });

      // calculate how far away we need to be to not hit the person spawning us
      const space = enemy.hitBubbleSize + projectile.hitBubbleSize;
      projectile.x = enemy.x + vel.x * space;
      projectile.y = enemy.y + vel.y * space;
      projectile.vel.x *= 5;
      projectile.vel.y *= 5;
    }
}, 1000);

// player moves in direction of respective arrow key
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

// returns the number of ents that are alive
// if there is 1 or less, the player has conquered the room
function aliveCount(ents) {
  return ents.filter((e) => e.alive()).length;
}

function* questGen(map) {
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
          // the code below is untested so it's probably broken
          new Message({
            text: "you have unlocked the door",
            color: "white",
            x: this.x,
            y: this.y,
            time: 3000,
          });
        }
      }
    },
  });

  // spawn player in the initial room (on the right relative to the map)
  player.x = map.oneoffs.spawnPlayer0[0] * MAP_SCALE;
  player.y = map.oneoffs.spawnPlayer0[1] * MAP_SCALE;

  let welcome = new Message({
    text: "Welcome there.",
    color: "white",
    x: player.x + 50,
    y: player.y - 50,
    time: 5000,
  });

  // eyeballz are the eyeballz that appear on the first quest, not to be confused with eyeballs
  let eyeballz = [];
  for (let i = 0; i < map.eyeballTwins.length; i++) {
    eyeballz.push(
      new Ent({
        shoots: true,
        draw: eyeDraw,
        x: map.eyeballTwins[i].pos[0] * MAP_SCALE, // TODO: fix eyeballz spawn location. maybe make it a oneoff? or relative to the players oneoff spawn location?
        y: map.eyeballTwins[i].pos[1] * MAP_SCALE,
      })
    );
  }

  // TODO: add stuuffff to this room

  // This is the room where enemies spawn around the player and shoot lasers
  // when all (but one) of the enemies are dead, the player can advance to the next room (the one with the MEGA-ME). x: 0 , y : 0

  // move onto the next quest when the player reaches the door
  // this is kind of hacky...what if the door changes it's position in the door array?
  // this code is also untested
  while (
    magnitude(
      {
        x: player.x - map.doors[2].pos[0],
        y: player.y - map.doors[2].pos[1],
      } < 1
    )
  )
    yield;

  // TODO / TO FIX: I think something is borked cause I can't seem to travel within the room in the first quest (quest0)

  yield* delay(5000);

  player.x = map.oneoffs.spawnPlayer1[0] * MAP_SCALE; // spawn the player in the room (in the middle of the eyeballs)
  player.y = map.oneoffs.spawnPlayer1[1] * MAP_SCALE;
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

  while (aliveCount(eyeballs) > 1) yield;

  eyeballs.concat(doors).forEach((e) => e.delete());

  // Room where the key is dropped
  // This is the room where the Mega-me and Mini-mes are
  // when all the minimes are gone (when there is one remaining), the key is dropped
  // the key can be used to "unlock" the key door (it's a one-off entity)

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
        // Mini-mes rotate around the mega-me
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

  // key is dropped in the middle of the room
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

  // Draw background color
  ctx.fillStyle = "rgb(40, 45, 60)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  playerLogic();

  ctx.save();

  // Update the camera with linear interpolation
  cam = lerp(cam, player, 0.1);
  ctx.translate(canvas.width / 2 - cam.x, canvas.height / 2 - cam.y);

  // draw the map using coordinates from map.json (Blender export)
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

  let msgTimeout;
  setTimeout(() => {
    for (const msg of messages) {
      ctx.fillStyle = msg.color;
      ctx.font = "20px Monospace";
      ctx.fillText(msg.text, msg.x, msg.y);
      msgTimeout = msg.time;
    }
  }, msgTimeout);

  // show player coordinates for debugging?
  ctx.fillText(
    `x: ${Math.round(player.x)} y: ${Math.round(player.y)}`,
    player.x + 300,
    player.y - 200
  );

  // Entity game loop
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

    // Normalize
    let m = normalize({
      x: ent.vel.x,
      y: ent.vel.y,
    });

    // Lasers are reflected off of walls
    (() => {
      const {
        pos: [x, y],
        scale,
      } = circles[0];
      const { t1 } = rayHitCircle({
        ro: { x: ent.x, y: ent.y },
        rd: m,
        circle: { x, y },
        radius: scale * MAP_SCALE,
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

    // Spiky entities are harmful when touched
    // ghosts are not affected by spiky entities
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

// Load images and quest map
Promise.all([loadImages, fetch("./map.json").then((r) => r.json())]).then(
  ([images, map]) => {
    console.log(map);
    state = { images, map, quest: questGen(map) };
    frame();
  }
);

setInterval(() => {}, 100);
