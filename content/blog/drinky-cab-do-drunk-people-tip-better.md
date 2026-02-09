---
title: "Do Drunk People Tip Better?"
description: "My friend Steve has a question about taxis, drinking, and tipping. We have 174 million taxi records. Let's find out."
series: "Drinky Cab"
weight: 10
skin: taxicab
---

My friend [Steve](http://www.orchardsa.com/leadership/) is an expert on taxis. He also has fair knowledge about drinking. He asked me to help him answer the question:

*Do drunk people tip taxi drivers better?*

This is the kind of question that sounds like a bar bet, and indeed it may have originated as one. But once you start thinking about it, it becomes a surprisingly deep data science problem. We don't have a breathalyzer attached to every taxi meter. Nobody checks a box on the receipt that says "currently hammered." We can't simply look up who was drunk and who was sober.

What we *can* do is build a model.

## The Data

Our primary weapon is the [notorious](http://flowingdata.com/2014/06/23/lessons-from-improperly-anonymized-taxi-logs/) NYC Taxi dataset — 174 million trip records obtained via Freedom of Information Law by [Chris Whong](http://www.chriswhong.com/open-data/foil_nyc_taxi/). Each record contains the pickup time, pickup location, dropoff location, fare, and tip amount (for credit card payments).

174 million records. If you printed each one on a Post-it note and lined them up, you could wallpaper roughly 4,000 apartments. Nobody asked for that calculation, but there it is.

We'll also need:

- **NY State Liquor License data** — every active liquor license in the state, with type, location, and establishment name
- **NYC shapefiles** — the street-level geometry we'll need later for routing

## The Problem

Here's the fundamental issue: there is no column in the taxi data called `was_passenger_drunk`. We can't just filter and compare. Instead, we need to build a **drinkiness model** — a way of assigning every taxi ride a probability that the passenger had been drinking.

Note that even if you accept our model as reasonable, and even if the research establishes a difference in tipping trends, the most we can say is: *"The data supports our hypothesis that drunk people tip differently."* We're not proving causation. We're building the best circumstantial case we can from 174 million data points.

Our model will use two signals:

1. **Where** was the taxi picked up? Specifically: how close was it to bars and other drinking establishments?
2. **When** was the pickup? A 2am Saturday pickup in the East Village has different implications than a 9am Tuesday pickup in Midtown.

Combine those two signals and we get a drinkiness score for each ride. Then we can split the rides into "probably drunk" and "probably sober" groups and compare their tipping behavior.

Simple in concept. In practice, this investigation will take us through interactive geographic visualizations, spatial data structures, custom distance metrics, a calculation that would take a million years if done naively, and more data cleaning than anyone should have to endure.

## The Plan

Here's what's coming in this series:

1. **You're here** — the question, the data, the approach
2. **[Mapping Every Bar in New York City](/blog/drinky-cab-mapping-every-bar/)** — visualizing 11,000 liquor licenses and discovering that JFK airport has a drinking problem (on paper, at least)
3. **[88.6 Million Taxi Rides](/blog/drinky-cab-88-million-taxi-rides/)** — filtering the data and uncovering temporal patterns that will feed our model
4. **[Stumbling Distance](/blog/drinky-cab-stumbling-distance/)** — building a custom "stumbling distance" metric, and why Google Maps would take a million years
5. **[The Verdict](/blog/drinky-cab-the-verdict/)** — the answer, which is more interesting than you'd expect

Let's start with the bars.
