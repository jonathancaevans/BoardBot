### --- Live Version ---
The web application is deployed on a Heroku site:

http://www.boardgan.com/

# BoardGAN

BoardGAN is a deep convolutional generative adversarial network that generates novel climbing routes for climbing training boards. BoardGAN is the first use case of a GAN for human interactive spatial data represented in an image like format. It has a live web version where model inference can be run via Flask, React, and Tensorflow.js. Generated routes are automatically pushed to their corresponding IOS/Android apps for climbers to use for training. It currently supports and is trained on the 12x12 kilterboard. The website is built on React and flask and features integration with the Kilterboard app which supports a live climbing experience with BoardGAN's output. Upcoming features include a conditional model that supports difficulty and climbing angle adjustment, word embedding into latent space for descriptive natural language processed routes, and support for different board configurations and brands.

### --- Before Starting --- 
   
Install Node.js on the host system.
Check successful installation by running:

$ node -v

$ npm -v

These should successfully return the node and npm versions of the system.

Install Python 3 on the host system.
Check successful installation by running:

$ python --version 

or 

$ python3 --version (for Linux Users)


### --- Project Dependencies ---

The project requires dependencies from both Node and Python. This involves the node_modules and the python libraries.
To install node_modules, run:

$npm install

To install python libraries, run:

$python install -r requirements.txt

### --- Structure of the Program --- 

The program is run by first running the Python Flask using:

$ python app.py

or 

$ python app.py (for Linux Users)

Then on another terminal, node can be run using:

$ npm start
