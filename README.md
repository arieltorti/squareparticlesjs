## squareParticles-js

### A tiny Javascript library for creating square particles (it also supports collisions).

## Usage

Using [npm](https://npmjs.org) run:

    $ npm install --save squareparticles-js

Using script, load using:

    <script src="particles.min.js"></script>

Run using:

    squareParticles({
        collision: true
    });

Stop playing with:

    var p = squareParticles();
    p.stop()

Resume:

    var p = squareParticles();
    p.resume()

![squareParticles Preview Image](https://i.imgur.com/aERFzkx.jpg)

## Configuration

name | type | default | detail
:---- | :----: | -------: | :------
| count | number | window size dependant | Total number of particles
| min_size | number | 2 | Minimum particle size
| max_size | number | window size dependant | Maximum particle size
| aging | boolean | true | Whether or not particle color changes with time
| color | function \| array(3) | - | Function or array defining particle colors
| canvas | string \| DOMElement | querySelector('canvas') | Canvas element where the rendering will happen
| min_speed | number | 0.5 | Maximum particle speed
| max_speed | number | 5 | Minimum particle speed
| collision | boolean | false | Enable or disable particle collisions

Example configuration object:

    var config = {
        aging: false,
        color: [0, 255, 0],
        canvas: "#myCanvas",
        collision: true
    }

## License

MIT