import json
import gdown
import os

with open('assets/data.json', 'r') as f:
    content = json.load(f)

animals = content['other']
for animal in animals:
    # get IDs for animal picture and habitat
    pic = animals[animal]['pic']
    hab = animals[animal]['habitat']
    # get the slideshow images for the animal
    slides = animals[animal]['info']['slides']

    # create folder for that animal
    try: os.mkdir(f'assets/img/{animal}')
    except FileExistsError: pass
    # create a folder for slides
    try: os.mkdir(f'assets/img/{animal}/slides')
    except FileExistsError: pass

    # download them into folders
    if not os.path.exists(f'assets/img/{animal}/{pic}.JPG'):
        print('Downloading animal:', animal, ',', pic)
        gdown.download(f'https://drive.google.com/uc?id={pic}', f'assets/img/{animal}/{pic}.JPG', cookies_file='cookies.txt')
    else: print('skipping animal:', animal, ',', pic)

    if not os.path.exists(f'assets/img/{animal}/{hab}.JPG'):
        print('Downloading habitat:', hab)
        gdown.download(f'https://drive.google.com/uc?id={hab}', f'assets/img/{animal}/{hab}.JPG', cookies_file='cookies.txt')
    else: print('skipping habitat:', hab)

    # download slides for animal
    if slides: print('Downloading slides for animal:', animal)
    for slide in slides:
        if os.path.exists(f'assets/img/{animal}/slides/{slide}.JPG'):
            print('skipping slide:', slide)
            continue
        print('Downloading slide:', slide)
        gdown.download(f'https://drive.google.com/uc?id={slide}', f'assets/img/{animal}/slides/{slide}.JPG', cookies_file='cookies.txt')