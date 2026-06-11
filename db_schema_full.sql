--
-- PostgreSQL database dump
--

-- Dumped from database version 12.22 (Ubuntu 12.22-0ubuntu0.20.04.4)
-- Dumped by pg_dump version 12.22 (Ubuntu 12.22-0ubuntu0.20.04.4)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name_en character varying(200),
    name_fr character varying(200)
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: countries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.countries (
    id integer NOT NULL,
    name_fr character varying(200) NOT NULL,
    name_en character varying(200) NOT NULL,
    code_iso character varying(3)
);


--
-- Name: countries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.countries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: countries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.countries_id_seq OWNED BY public.countries.id;


--
-- Name: directions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.directions (
    id integer NOT NULL,
    recipe_id integer,
    step_number integer,
    instruction text
);


--
-- Name: directions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.directions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: directions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.directions_id_seq OWNED BY public.directions.id;


--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ingredients (
    id integer NOT NULL,
    recipe_id integer,
    product_id integer,
    quantity character varying(50),
    unit character varying(50),
    raw_text text,
    "position" integer
);


--
-- Name: ingredients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ingredients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ingredients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ingredients_id_seq OWNED BY public.ingredients.id;


--
-- Name: product_prices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_prices (
    id integer NOT NULL,
    product_id integer NOT NULL,
    variety_id integer,
    price numeric(10,2) NOT NULL,
    unit character varying(50) NOT NULL,
    currency character varying(10) DEFAULT 'EUR'::character varying NOT NULL,
    market character varying(200)
);


--
-- Name: product_prices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_prices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_prices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_prices_id_seq OWNED BY public.product_prices.id;


--
-- Name: product_seasons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_seasons (
    id integer NOT NULL,
    product_id integer NOT NULL,
    season_id integer NOT NULL,
    note text
);


--
-- Name: product_seasons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_seasons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_seasons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_seasons_id_seq OWNED BY public.product_seasons.id;


--
-- Name: product_varieties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_varieties (
    id integer NOT NULL,
    product_id integer NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    region_id integer,
    country_id integer,
    season_id integer
);


--
-- Name: product_varieties_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_varieties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_varieties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_varieties_id_seq OWNED BY public.product_varieties.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(500) NOT NULL
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: recipe_seasons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_seasons (
    id integer NOT NULL,
    recipe_id integer NOT NULL,
    season_id integer NOT NULL,
    note text
);


--
-- Name: recipe_seasons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipe_seasons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipe_seasons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipe_seasons_id_seq OWNED BY public.recipe_seasons.id;


--
-- Name: recipe_specialties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_specialties (
    id integer NOT NULL,
    recipe_id integer NOT NULL,
    country_id integer,
    region_id integer,
    description text
);


--
-- Name: recipe_specialties_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipe_specialties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipe_specialties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipe_specialties_id_seq OWNED BY public.recipe_specialties.id;


--
-- Name: recipes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipes (
    id integer NOT NULL,
    recipe_title character varying(500),
    category_en character varying(200),
    category_fr character varying(200),
    subcategory_en character varying(200),
    subcategory_fr character varying(200),
    description text,
    ingredients json,
    directions json,
    num_ingredients integer,
    num_steps integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: recipes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipes_id_seq OWNED BY public.recipes.id;


--
-- Name: recipes_new; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipes_new (
    id integer NOT NULL,
    recipe_title character varying(500),
    description text,
    category_id integer,
    subcategory_id integer,
    num_ingredients integer,
    num_steps integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: recipes_new_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipes_new_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipes_new_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipes_new_id_seq OWNED BY public.recipes_new.id;


--
-- Name: regions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.regions (
    id integer NOT NULL,
    name_fr character varying(200) NOT NULL,
    name_en character varying(200),
    country_id integer
);


--
-- Name: regions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.regions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: regions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.regions_id_seq OWNED BY public.regions.id;


--
-- Name: seasons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seasons (
    id integer NOT NULL,
    name_fr character varying(50) NOT NULL,
    name_en character varying(50) NOT NULL,
    month_start smallint NOT NULL,
    month_end smallint NOT NULL,
    emoji character varying(10),
    CONSTRAINT seasons_month_end_check CHECK (((month_end >= 1) AND (month_end <= 12))),
    CONSTRAINT seasons_month_start_check CHECK (((month_start >= 1) AND (month_start <= 12)))
);


--
-- Name: seasons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seasons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seasons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.seasons_id_seq OWNED BY public.seasons.id;


--
-- Name: subcategories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subcategories (
    id integer NOT NULL,
    name_en character varying(200),
    name_fr character varying(200),
    category_id integer
);


--
-- Name: subcategories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subcategories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subcategories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subcategories_id_seq OWNED BY public.subcategories.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: countries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.countries ALTER COLUMN id SET DEFAULT nextval('public.countries_id_seq'::regclass);


--
-- Name: directions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.directions ALTER COLUMN id SET DEFAULT nextval('public.directions_id_seq'::regclass);


--
-- Name: ingredients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients ALTER COLUMN id SET DEFAULT nextval('public.ingredients_id_seq'::regclass);


--
-- Name: product_prices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_prices ALTER COLUMN id SET DEFAULT nextval('public.product_prices_id_seq'::regclass);


--
-- Name: product_seasons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_seasons ALTER COLUMN id SET DEFAULT nextval('public.product_seasons_id_seq'::regclass);


--
-- Name: product_varieties id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_varieties ALTER COLUMN id SET DEFAULT nextval('public.product_varieties_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: recipe_seasons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_seasons ALTER COLUMN id SET DEFAULT nextval('public.recipe_seasons_id_seq'::regclass);


--
-- Name: recipe_specialties id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_specialties ALTER COLUMN id SET DEFAULT nextval('public.recipe_specialties_id_seq'::regclass);


--
-- Name: recipes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes ALTER COLUMN id SET DEFAULT nextval('public.recipes_id_seq'::regclass);


--
-- Name: recipes_new id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes_new ALTER COLUMN id SET DEFAULT nextval('public.recipes_new_id_seq'::regclass);


--
-- Name: regions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regions ALTER COLUMN id SET DEFAULT nextval('public.regions_id_seq'::regclass);


--
-- Name: seasons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasons ALTER COLUMN id SET DEFAULT nextval('public.seasons_id_seq'::regclass);


--
-- Name: subcategories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcategories ALTER COLUMN id SET DEFAULT nextval('public.subcategories_id_seq'::regclass);


--
-- Name: categories categories_name_en_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_en_key UNIQUE (name_en);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: countries countries_code_iso_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_code_iso_key UNIQUE (code_iso);


--
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (id);


--
-- Name: directions directions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.directions
    ADD CONSTRAINT directions_pkey PRIMARY KEY (id);


--
-- Name: ingredients ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_pkey PRIMARY KEY (id);


--
-- Name: product_prices product_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT product_prices_pkey PRIMARY KEY (id);


--
-- Name: product_seasons product_seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_seasons
    ADD CONSTRAINT product_seasons_pkey PRIMARY KEY (id);


--
-- Name: product_seasons product_seasons_product_id_season_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_seasons
    ADD CONSTRAINT product_seasons_product_id_season_id_key UNIQUE (product_id, season_id);


--
-- Name: product_varieties product_varieties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_varieties
    ADD CONSTRAINT product_varieties_pkey PRIMARY KEY (id);


--
-- Name: products products_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_name_key UNIQUE (name);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: recipe_seasons recipe_seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_seasons
    ADD CONSTRAINT recipe_seasons_pkey PRIMARY KEY (id);


--
-- Name: recipe_seasons recipe_seasons_recipe_id_season_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_seasons
    ADD CONSTRAINT recipe_seasons_recipe_id_season_id_key UNIQUE (recipe_id, season_id);


--
-- Name: recipe_specialties recipe_specialties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_specialties
    ADD CONSTRAINT recipe_specialties_pkey PRIMARY KEY (id);


--
-- Name: recipes_new recipes_new_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes_new
    ADD CONSTRAINT recipes_new_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: regions regions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_pkey PRIMARY KEY (id);


--
-- Name: seasons seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasons
    ADD CONSTRAINT seasons_pkey PRIMARY KEY (id);


--
-- Name: subcategories subcategories_name_en_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcategories
    ADD CONSTRAINT subcategories_name_en_key UNIQUE (name_en);


--
-- Name: subcategories subcategories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcategories
    ADD CONSTRAINT subcategories_pkey PRIMARY KEY (id);


--
-- Name: idx_category_en; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_category_en ON public.recipes USING btree (category_en);


--
-- Name: idx_category_fr; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_category_fr ON public.recipes USING btree (category_fr);


--
-- Name: idx_directions_recipe; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_directions_recipe ON public.directions USING btree (recipe_id);


--
-- Name: idx_ingredients_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ingredients_product ON public.ingredients USING btree (product_id);


--
-- Name: idx_ingredients_recipe; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ingredients_recipe ON public.ingredients USING btree (recipe_id);


--
-- Name: idx_prices_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prices_product ON public.product_prices USING btree (product_id);


--
-- Name: idx_product_seasons_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_seasons_product ON public.product_seasons USING btree (product_id);


--
-- Name: idx_products_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_name ON public.products USING btree (name);


--
-- Name: idx_recipe_seasons_recipe; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recipe_seasons_recipe ON public.recipe_seasons USING btree (recipe_id);


--
-- Name: idx_recipes_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recipes_category ON public.recipes_new USING btree (category_id);


--
-- Name: idx_regions_country; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_regions_country ON public.regions USING btree (country_id);


--
-- Name: idx_specialties_recipe; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_specialties_recipe ON public.recipe_specialties USING btree (recipe_id);


--
-- Name: idx_varieties_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_varieties_product ON public.product_varieties USING btree (product_id);


--
-- Name: directions directions_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.directions
    ADD CONSTRAINT directions_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes_new(id) ON DELETE CASCADE;


--
-- Name: ingredients ingredients_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: ingredients ingredients_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes_new(id) ON DELETE CASCADE;


--
-- Name: product_prices product_prices_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT product_prices_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: product_prices product_prices_variety_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT product_prices_variety_id_fkey FOREIGN KEY (variety_id) REFERENCES public.product_varieties(id);


--
-- Name: product_seasons product_seasons_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_seasons
    ADD CONSTRAINT product_seasons_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: product_seasons product_seasons_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_seasons
    ADD CONSTRAINT product_seasons_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id);


--
-- Name: product_varieties product_varieties_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_varieties
    ADD CONSTRAINT product_varieties_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id);


--
-- Name: product_varieties product_varieties_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_varieties
    ADD CONSTRAINT product_varieties_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: product_varieties product_varieties_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_varieties
    ADD CONSTRAINT product_varieties_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id);


--
-- Name: product_varieties product_varieties_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_varieties
    ADD CONSTRAINT product_varieties_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id);


--
-- Name: recipe_seasons recipe_seasons_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_seasons
    ADD CONSTRAINT recipe_seasons_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes_new(id) ON DELETE CASCADE;


--
-- Name: recipe_seasons recipe_seasons_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_seasons
    ADD CONSTRAINT recipe_seasons_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id);


--
-- Name: recipe_specialties recipe_specialties_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_specialties
    ADD CONSTRAINT recipe_specialties_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id);


--
-- Name: recipe_specialties recipe_specialties_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_specialties
    ADD CONSTRAINT recipe_specialties_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes_new(id) ON DELETE CASCADE;


--
-- Name: recipe_specialties recipe_specialties_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_specialties
    ADD CONSTRAINT recipe_specialties_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id);


--
-- Name: recipes_new recipes_new_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes_new
    ADD CONSTRAINT recipes_new_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: recipes_new recipes_new_subcategory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes_new
    ADD CONSTRAINT recipes_new_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.subcategories(id);


--
-- Name: regions regions_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id);


--
-- Name: subcategories subcategories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcategories
    ADD CONSTRAINT subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- PostgreSQL database dump complete
--

