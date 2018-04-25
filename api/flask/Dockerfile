FROM continuumio/miniconda3:4.4.10

RUN apt-get update && \
    apt-get install -y netcat build-essential

RUN conda update -n base conda && \
    conda config --add channels conda-forge && \
    conda create -y -n flask \
        python=3 \
        scikit-learn \
        flask=0.12 \
        uwsgi \
        SQLAlchemy \
        psycopg2 \
        flask-restful \
        pybind11


# alternative to `source activate flask`
ENV PATH /opt/conda/envs/flask/bin:$PATH

# can't figure out how to install this into the conda environment
RUN pip install firebase-admin Flask-API

# install fasttext from git repo
RUN git clone https://github.com/facebookresearch/fastText.git && \
    cd fastText && \
    pip install .

# Create a flask user to avoid running uwsgi as root
RUN useradd -r flask
COPY . /app
WORKDIR /app
RUN chown -R flask /app
USER flask

HEALTHCHECK --interval=12s --timeout=12s --start-period=30s \
 CMD nc -z localhost 5000

EXPOSE 5000

CMD ["uwsgi", "--enable-threads", "--http-socket", "0.0.0.0:5000", "--wsgi-file", "app.py", "--callable", "app"]
