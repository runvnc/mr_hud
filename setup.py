from setuptools import setup, find_packages

setup(
    name="mr_hud",
    version="1.0.0",
    packages=find_packages(where="src"),
    package_dir={"":"src"},
    include_package_data=True,
    package_data={
        'mr_hud': [
            'static/js/*.js',
            'inject/*.jinja2',
        ],
    },
    install_requires=[],
)
